import {
  getQuoteSubtotal,
  getQuoteTax,
  getQuoteTotal,
  getSalesTaxLabel,
} from './quoteTotals'

const company = {
  name: 'Capital Lumber Co.',
  address: '3105 W. State St. Boise, ID 83703',
  phone: '208-343-5481',
  hours: 'M-F 7:30-5 | Sat 9-4',
}

function formatMoney(value) {
  return `$${value.toFixed(2)}`
}

function getSku(product) {
  return product.category === 'Delivery'
    ? 'DELIVERY'
    : product.stockSku || product.id.toUpperCase()
}

function getPdfSku(product) {
  const sku = getSku(product)

  if (sku.length <= 14) {
    return sku
  }

  return `${sku.slice(0, 11)}...`
}

function getSafeFileDate() {
  return new Date().toISOString().slice(0, 10)
}

function getQuoteNumber() {
  const value = Math.floor(100000 + Math.random() * 900000).toString()
  return `${value.slice(0, 3)}-${value.slice(3)}`
}

async function getLogoDataUrl() {
  try {
    const response = await fetch('/site-logo.svg')
    const svgText = await response.text()
    const image = new Image()
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`

    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject
      image.src = svgUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = 900
    canvas.height = 256
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

function addFooter(doc, pageNumber) {
  doc.setDrawColor(230, 226, 220)
  doc.line(36, 744, 576, 744)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(110, 103, 94)
  doc.text(
    'Prices, stock, and delivery are for planning only and should be confirmed with the counter.',
    36,
    760,
  )
  doc.text(`Page ${pageNumber}`, 548, 760, { align: 'right' })
}

function addHeader(doc, logoDataUrl, quoteNumber, title) {
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', 36, 34, 190, 54)
  } else {
    doc.setFillColor(252, 44, 56)
    doc.rect(36, 36, 8, 46, 'F')
    doc.setTextColor(28, 25, 23)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(company.name, 56, 58)
  }

  doc.setTextColor(28, 25, 23)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('Material List', 36, 116)
  doc.setFontSize(12)
  doc.setTextColor(28, 25, 23)
  doc.text(title || 'Untitled Project', 36, 136)
  doc.setFontSize(10)
  doc.setTextColor(252, 44, 56)
  doc.text(`Quote # ${quoteNumber}`, 36, 154)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(87, 83, 78)
  doc.text(company.address, 380, 48)
  doc.text(company.phone, 380, 62)
  doc.text(company.hours, 380, 76)
}

function addTableHeader(doc, y) {
  doc.setFillColor(245, 242, 237)
  doc.rect(36, y - 14, 540, 24, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(87, 83, 78)
  doc.text('SKU', 48, y)
  doc.text('ITEM', 145, y)
  doc.text('QTY', 374, y, { align: 'right' })
  doc.text('UNIT', 426, y, { align: 'right' })
  doc.text('PRICE', 500, y, { align: 'right' })
  doc.text('TOTAL', 564, y, { align: 'right' })
}

export async function downloadMaterialListPdf(items, sections = [], title = '') {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ format: 'letter', unit: 'pt' })
  const logoDataUrl = await getLogoDataUrl()
  const quoteNumber = getQuoteNumber()
  const subtotal = getQuoteSubtotal(items)
  const salesTax = getQuoteTax(subtotal)
  const total = getQuoteTotal(subtotal)
  let pageNumber = 1
  let y = 184
  const availableSections = sections.length
    ? sections
    : [{ id: 'general', name: 'General Materials' }]
  const groupedSections = availableSections
    .map((section) => ({
      ...section,
      items: items.filter(
        (item) => (item.sectionId || availableSections[0]?.id) === section.id,
      ),
    }))
    .filter((section) => section.items.length)

  addHeader(doc, logoDataUrl, quoteNumber, title)

  groupedSections.forEach((section) => {
    if (y > 700) {
      addFooter(doc, pageNumber)
      doc.addPage()
      pageNumber += 1
      addHeader(doc, logoDataUrl, quoteNumber, title)
      y = 184
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(28, 25, 23)
    doc.text(section.name, 36, y)
    y += 24

    addTableHeader(doc, y)
    y += 26

    section.items.forEach((item) => {
      if (y > 700) {
        addFooter(doc, pageNumber)
        doc.addPage()
        pageNumber += 1
        addHeader(doc, logoDataUrl, quoteNumber, title)
        y = 184
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.setTextColor(28, 25, 23)
        doc.text(section.name, 36, y)
        y += 24
        addTableHeader(doc, y)
        y += 26
      }

      const { product, quantity } = item
      const lineTotal = product.price * quantity
      const itemLines = doc.splitTextToSize(product.name, 195)
      const detailText =
        product.category === 'Delivery'
          ? product.deliveryMethod
          : `${product.dimensions} | ${product.grade}`
      const detailLines = doc.splitTextToSize(detailText, 195)
      const rowHeight = Math.max(50, 18 + (itemLines.length + detailLines.length) * 10)

      doc.setDrawColor(232, 228, 222)
      doc.line(36, y - 12, 576, y - 12)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(28, 25, 23)
      doc.text(getPdfSku(product), 48, y)
      doc.text(itemLines, 145, y)
      doc.text(String(quantity), 374, y, { align: 'right' })
      doc.text(product.unit, 426, y, { align: 'right' })
      doc.text(formatMoney(product.price), 500, y, { align: 'right' })
      doc.text(formatMoney(lineTotal), 564, y, { align: 'right' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(110, 103, 94)
      doc.text(detailLines, 145, y + itemLines.length * 11 + 4)

      y += rowHeight
    })

    y += 12
  })

  y = Math.max(y + 12, 642)
  doc.setDrawColor(28, 25, 23)
  doc.line(390, y, 576, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(28, 25, 23)
  doc.text('Subtotal', 430, y + 24)
  doc.text(formatMoney(subtotal), 576, y + 24, { align: 'right' })
  doc.setFontSize(10)
  doc.setTextColor(87, 83, 78)
  doc.text(getSalesTaxLabel(), 430, y + 42)
  doc.text(formatMoney(salesTax), 576, y + 42, { align: 'right' })
  doc.setFontSize(16)
  doc.setTextColor(28, 25, 23)
  doc.text('Total', 430, y + 66)
  doc.setFontSize(18)
  doc.text(formatMoney(total), 576, y + 66, { align: 'right' })

  addFooter(doc, pageNumber)
  doc.save(`capital-lumber-material-list-${quoteNumber}-${getSafeFileDate()}.pdf`)
}
