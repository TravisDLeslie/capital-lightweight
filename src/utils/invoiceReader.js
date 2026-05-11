import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeMoney(value) {
  let cleanValue = value.replace(/,/g, '').trim()
  let sign = 1

  if (cleanValue.includes('-')) {
    sign = -1
    cleanValue = cleanValue.replace(/-/g, '')
  }

  if (cleanValue.startsWith('.')) {
    cleanValue = `0${cleanValue}`
  }

  const [rawIntegerPart, cents = '00'] = cleanValue.split('.')
  let integerPart = rawIntegerPart || '0'

  if (integerPart.length % 2 === 0) {
    const midpoint = integerPart.length / 2
    const firstHalf = integerPart.slice(0, midpoint)
    const secondHalf = integerPart.slice(midpoint)

    if (firstHalf === secondHalf) {
      integerPart = firstHalf
    }
  }

  return sign * Number(`${integerPart}.${cents}`)
}

function isDuplicatedStatementMoney(value) {
  const cleanValue = value.replace(/,/g, '')
  const [integerPart] = cleanValue.split('.')

  if (integerPart.length < 4 || integerPart.length % 2 !== 0) {
    return false
  }

  const midpoint = integerPart.length / 2
  return integerPart.slice(0, midpoint) === integerPart.slice(midpoint)
}

function formatMoney(value) {
  return `$${value.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`
}

function formatDate(value) {
  const parts = value.split('/')

  if (parts.length !== 3) {
    return value
  }

  const [month, day, year] = parts
  const fullYear = year.length === 2 ? `20${year}` : year

  return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${fullYear}`
}

function getSignedAmount(type, amount) {
  return type.toUpperCase() === 'CM' && amount > 0 ? -amount : amount
}

export async function extractPdfText(file) {
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const pages = []
  const positionedItems = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1 })
    const content = await page.getTextContent()

    pages.push(content.items.map((item) => item.str).join(' '))

    content.items.forEach((item) => {
      const [, , , , x, y] = item.transform

      if (!item.str.trim()) {
        return
      }

      positionedItems.push({
        pageNumber,
        text: item.str,
        top: viewport.height - y,
        x,
        y,
      })
    })
  }

  return {
    positionedItems,
    text: normalizeWhitespace(pages.join(' ')),
  }
}

function getColumnItem(rowItems, minX, maxX) {
  return rowItems.find((item) => item.x >= minX && item.x <= maxX)?.text || ''
}

function parseRowsByPosition(positionedItems) {
  if (!positionedItems?.length) {
    return []
  }

  const dateItems = positionedItems.filter(
    (item) =>
      item.x >= 15 &&
      item.x <= 65 &&
      item.top >= 300 &&
      item.top <= 720 &&
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(item.text),
  )

  return dateItems
    .map((dateItem) => {
      const rowItems = positionedItems.filter(
        (item) =>
          item.pageNumber === dateItem.pageNumber &&
          Math.abs(item.top - dateItem.top) < 2,
      )
      const invoiceNumber = getColumnItem(rowItems, 70, 170)
      const type = getColumnItem(rowItems, 170, 220)
      const grossAmount = getColumnItem(rowItems, 220, 315)

      if (!invoiceNumber || !type || !grossAmount) {
        return null
      }

      const normalizedAmount = normalizeMoney(grossAmount)

      if (!Number.isFinite(normalizedAmount)) {
        return null
      }

      return {
        grossAmount: getSignedAmount(type, normalizedAmount),
        invoiceDate: formatDate(dateItem.text),
        invoiceNumber,
        type: type.toUpperCase(),
      }
    })
    .filter(Boolean)
}

function parseStatementBalanceTotal(text) {
  if (typeof text !== 'object' || !text?.positionedItems?.length) {
    return null
  }

  const lastPageNumber = Math.max(
    ...text.positionedItems.map((item) => item.pageNumber),
  )
  const footerTotal = text.positionedItems
    .filter(
      (item) =>
        item.pageNumber === lastPageNumber &&
        item.x >= 280 &&
        item.x <= 320 &&
        item.top >= 460 &&
        item.top <= 540 &&
        /[\d,]+\.\d{2}/.test(item.text),
    )
    .map((item) => normalizeMoney(item.text))
    .find((amount) => Number.isFinite(amount))

  if (Number.isFinite(footerTotal)) {
    return footerTotal
  }

  const balanceDueMatch = text.text?.match(/\$?([\d,]+\.\d{2})\1?\s+Bill-to/i)
  const balanceDue = balanceDueMatch ? normalizeMoney(balanceDueMatch[1]) : null

  return Number.isFinite(balanceDue) ? balanceDue : null
}

function reconcileToStatementBalance(rows, text) {
  const isBoiseCascadeStatement = rows.some((row) =>
    row.invoiceNumber.startsWith('BO'),
  )
  const statementBalance = parseStatementBalanceTotal(text)

  if (!isBoiseCascadeStatement || !Number.isFinite(statementBalance)) {
    return rows
  }

  const rowTotal = rows.reduce((total, row) => total + row.grossAmount, 0)
  const difference = Number((statementBalance - rowTotal).toFixed(2))

  if (Math.abs(difference) < 0.01) {
    return rows
  }

  return [
    ...rows,
    {
      grossAmount: difference,
      invoiceDate: '',
      invoiceNumber: 'Boise Cascade statement balance adjustment',
      type: 'ADJ',
    },
  ]
}

export function parseInvoiceRows(text) {
  if (typeof text === 'object' && text?.positionedItems?.length) {
    const positionedRows = parseRowsByPosition(text.positionedItems)

    if (positionedRows.length) {
      return reconcileToStatementBalance(positionedRows, text)
    }
  }

  const normalizedText = normalizeWhitespace(typeof text === 'string' ? text : text.text)
  const rowPattern = new RegExp(
    '\\b(INVOICE|CM)\\s+([A-Z0-9-]+)\\s+(\\d{1,2}\\/\\d{1,2}\\/\\d{2,4})([\\s\\S]*?)(?=\\b(?:INVOICE|CM)\\s+[A-Z0-9-]+\\s+\\d{1,2}\\/\\d{1,2}\\/\\d{2,4}|Total Discount|$)',
    'gi',
  )
  const moneyPattern = /(?:\d{1,3}(?:,\d{3})+|\d+)?\.\d{2}|\d[\d,]*\d\.\d{2}/g
  const rows = []

  for (const match of normalizedText.matchAll(rowPattern)) {
    const [, type, invoiceNumber, invoiceDate, rowText] = match
    const amounts = [...rowText.matchAll(moneyPattern)].map(
      (amountMatch) => amountMatch[0],
    )
    const grossAmount =
      amounts.find((amount) => isDuplicatedStatementMoney(amount)) || amounts[0]

    if (!grossAmount) {
      continue
    }

    const normalizedAmount = normalizeMoney(grossAmount)

    if (!Number.isFinite(normalizedAmount)) {
      continue
    }

    rows.push({
      grossAmount: getSignedAmount(type, normalizedAmount),
      invoiceDate: formatDate(invoiceDate),
      invoiceNumber,
      type: type.toUpperCase(),
    })
  }

  return rows
}

export function getStatementSummary(text) {
  const rows = parseInvoiceRows(text)
  const grossTotal = rows.reduce((total, row) => total + row.grossAmount, 0)

  return {
    grossTotal,
    rows,
  }
}

export async function downloadInvoiceReaderPdf({
  documentType,
  rows,
  sourceFileName,
  vendor,
}) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ format: 'letter', unit: 'pt' })
  const generatedDate = new Date().toLocaleDateString()
  const grossTotal = rows.reduce((total, row) => total + row.grossAmount, 0)
  let y = 148

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(28, 25, 23)
  doc.text('Invoice Reader Export', 36, 48)

  doc.setFontSize(10)
  doc.setTextColor(100, 92, 84)
  doc.text(`Vendor: ${vendor}`, 36, 76)
  doc.text(`Document type: ${documentType}`, 36, 92)
  doc.text(`Source: ${sourceFileName || 'Uploaded PDF'}`, 36, 108)
  doc.text(`Generated: ${generatedDate}`, 36, 124)

  doc.setFillColor(245, 242, 237)
  doc.rect(36, y - 18, 540, 28, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(87, 83, 78)
  doc.text('CATEGORY', 52, y)
  doc.text('DESCRIPTION', 250, y)
  doc.text('AMOUNT', 560, y, { align: 'right' })
  y += 28

  rows.forEach((row) => {
    if (y > 730) {
      doc.addPage()
      y = 60
    }

    doc.setDrawColor(232, 228, 222)
    doc.line(36, y - 14, 576, y - 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(28, 25, 23)
    doc.text('Cost of Goods Sold', 52, y)
    doc.text(row.invoiceNumber, 250, y)
    doc.text(formatMoney(row.grossAmount), 560, y, { align: 'right' })
    y += 28
  })

  y += 12
  doc.setDrawColor(28, 25, 23)
  doc.line(360, y - 12, 576, y - 12)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Total', 360, y)
  doc.text(formatMoney(grossTotal), 560, y, { align: 'right' })

  doc.save(`invoice-reader-${Date.now()}.pdf`)
}

export { formatMoney }
