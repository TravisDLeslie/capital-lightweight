/* global process */

import fs from 'node:fs'
import path from 'node:path'

const airtableApiUrl = 'https://api.airtable.com/v0'
const cacheDurationMs = 5 * 60 * 1000

let productCache = {
  expiresAt: 0,
  products: null,
}

function loadLocalEnv() {
  if (process.env.VERCEL_ENV) return

  const envPath = path.join(process.cwd(), '.env.local')

  if (!fs.existsSync(envPath)) return

  const envText = fs.readFileSync(envPath, 'utf8')

  envText.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) return

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex === -1) return

    const key = trimmedLine.slice(0, separatorIndex)
    const value = trimmedLine.slice(separatorIndex + 1)

    if (!process.env[key]) {
      process.env[key] = value
    }
  })
}

function getEnvValue(...keys) {
  loadLocalEnv()

  return keys.map((key) => process.env[key]).find(Boolean)
}

function getField(fields, names, fallback = '') {
  const match = names.find((name) => fields[name] !== undefined)

  return match ? fields[match] : fallback
}

function parseNumber(value, fallback = 0) {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return fallback

  const parsed = Number(value.replace(/[$,]/g, '').trim())

  return Number.isFinite(parsed) ? parsed : fallback
}

function getUnitInfo(fields) {
  const rawUnit = getField(fields, ['Unit', 'UOM', 'Selling Unit'], 'each')
  const unitText = String(rawUnit || '').trim()
  const numericUnit = parseNumber(unitText, null)

  if (numericUnit !== null) {
    return {
      piecesPerUnit: numericUnit,
      unit: 'each',
    }
  }

  return {
    piecesPerUnit: parseNumber(
      getField(fields, ['Pieces Per Unit', 'Sheets Per Unit', 'Bundle Qty']),
    ),
    unit: unitText || 'each',
  }
}

function parseList(value) {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean)
  }

  return String(value)
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function getAttachmentUrl(value) {
  if (!value) return ''

  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value[0]?.url || value[0]?.thumbnails?.large?.url || ''
  }

  return value.url || ''
}

function mapAirtableRecord(record) {
  const fields = record.fields || {}
  const unitInfo = getUnitInfo(fields)
  const sku = String(
    getField(fields, ['SKU', 'Sku', 'sku', 'Internal SKU', 'Stock SKU'], record.id),
  ).trim()
  const name = String(
    getField(fields, ['Name', 'Item Name', 'Product Name', 'Item'], ''),
  ).trim()
  const dimensions = String(
    getField(fields, ['Dimensions', 'Size', 'Description'], ''),
  ).trim()
  const aliases = [
    sku,
    name,
    dimensions,
    ...parseList(getField(fields, ['Aliases', 'Alias', 'Search Keywords', 'Keywords'])),
  ].filter(Boolean)

  return {
    id: sku || record.id,
    airtableRecordId: record.id,
    stockSku: sku,
    name,
    category: String(getField(fields, ['Category'], 'Uncategorized')).trim(),
    subcategory: String(getField(fields, ['Subcategory', 'Sub Category'], '')).trim(),
    dimensions,
    grade: String(getField(fields, ['Grade'], '')).trim(),
    gradeNote: String(getField(fields, ['Grade Note', 'GradeNote'], '')).trim(),
    gradeTooltip: String(
      getField(fields, ['Grade Tooltip', 'GradeTooltip'], ''),
    ).trim(),
    price: parseNumber(getField(fields, ['Price', 'Retail Price', 'Unit Price'])),
    unit: unitInfo.unit,
    piecesPerUnit: unitInfo.piecesPerUnit,
    stock: parseNumber(
      getField(fields, ['Stock Qty', 'Stock', 'Qty On Hand', 'Quantity On Hand']),
    ),
    location: String(getField(fields, ['Location', 'Bin', 'Yard Location'], '')).trim(),
    availabilityStatus: String(
      getField(fields, ['Availability Status', 'Availability'], 'in-stock'),
    ).trim(),
    leadTime: String(getField(fields, ['Lead Time', 'LeadTime'], '')).trim(),
    image: getAttachmentUrl(getField(fields, ['Image', 'Photo', 'Product Image'])),
    priceVerifiedAt: getField(fields, ['Price Verified At', 'Price Verified']),
    aliases,
  }
}

async function fetchAirtableProducts() {
  const baseId = getEnvValue('AIRTABLE_PRODUCTS_BASE_ID', 'AIRTABLE_BASE_ID')
  const tableId = getEnvValue(
    'AIRTABLE_PRODUCTS_TABLE_ID',
    'AIRTABLE_PRODUCT_TABLE_ID',
    'AIRTABLE_TABLE_ID',
  )
  const token = getEnvValue('AIRTABLE_PRODUCTS_TOKEN', 'AIRTABLE_TOKEN')
  const view = getEnvValue('AIRTABLE_PRODUCTS_VIEW')

  if (!baseId || !tableId || !token) {
    return {
      products: [],
      skipped: true,
      error:
        'Missing Airtable environment variables. Set AIRTABLE_TOKEN, AIRTABLE_BASE_ID, and AIRTABLE_PRODUCTS_TABLE_ID.',
    }
  }

  const records = []
  let offset = ''

  do {
    const params = new URLSearchParams({
      pageSize: '100',
    })

    if (offset) params.set('offset', offset)
    if (view) params.set('view', view)

    const airtableResponse = await fetch(
      `${airtableApiUrl}/${baseId}/${encodeURIComponent(tableId)}?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!airtableResponse.ok) {
      const message = await airtableResponse.text()
      throw new Error(message)
    }

    const data = await airtableResponse.json()
    records.push(...(data.records || []))
    offset = data.offset || ''
  } while (offset)

  const products = records
    .filter((record) => {
      const active = getField(record.fields || {}, ['Active', 'Is Active'], true)
      return active !== false
    })
    .map(mapAirtableRecord)
    .filter((product) => product.name)

  return {
    products,
    skipped: false,
  }
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  if (productCache.products && productCache.expiresAt > Date.now()) {
    return response.status(200).json({
      cached: true,
      products: productCache.products,
    })
  }

  try {
    const result = await fetchAirtableProducts()

    if (!result.skipped) {
      productCache = {
        expiresAt: Date.now() + cacheDurationMs,
        products: result.products,
      }
    }

    return response.status(200).json({
      cached: false,
      ...result,
    })
  } catch (error) {
    return response.status(500).json({
      error: error.message,
      products: [],
    })
  }
}
