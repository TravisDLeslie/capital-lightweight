import { storeInfo } from '../data/storeInfo.js'
import { normalizeQuery } from '../products/productSearch.js'

const productLookupTerms = [
  'osb',
  'tg',
  'zip',
  'advantech',
  'plywood',
  'sheathing',
  'cedar',
  'redwood',
  'lvl',
  'tji',
  'microllam',
  'simpson',
  'hanger',
  'treated',
  'pressuretreated',
]

const browseInventoryPhrases = [
  'what do you have in stock',
  'what do you stock',
  'what do you carry',
  'what products do you have',
  'what materials do you carry',
  'show me what you stock',
  'show me what you carry',
]

const featuredInventoryNames = [
  '2x4-8 #1 DF-L',
  '7/16 OSB Sheathing',
  'Zip 7/16 OSB Sheathing',
  '2x4-8 D.F. Treated CAC .15',
  'TJI 110 1-3/4 in flange by 11-7/8 in',
  'Simpson LUS24Z 2x4 Joist Hanger',
]

function isBrowseInventoryQuestion(prompt) {
  const normalizedPrompt = normalizeQuery(prompt)

  return browseInventoryPhrases.some((phrase) =>
    normalizedPrompt.includes(normalizeQuery(phrase)),
  )
}

function looksLikeProductLookup(prompt) {
  const normalizedPrompt = normalizeQuery(prompt)

  if (isBrowseInventoryQuestion(prompt)) {
    return false
  }

  return (
    /\bsku\s*#?\s*[a-z0-9-]+/i.test(prompt) ||
    /\b\d+\s*x\s*\d+/i.test(prompt) ||
    /\b\d+\/\d+\b/.test(prompt) ||
    productLookupTerms.some((term) => normalizedPrompt.includes(term))
  )
}

function getFeaturedInventoryProducts(products = []) {
  const featuredProducts = featuredInventoryNames
    .map((name) => {
      const normalizedName = normalizeQuery(name)

      return products.find((product) => normalizeQuery(product.name) === normalizedName)
    })
    .filter(Boolean)

  if (featuredProducts.length) {
    return featuredProducts
  }

  return products.slice(0, 6)
}

export const inventoryIntent = {
  name: 'inventory',
  strongKeywords: [
    'do you stock',
    'do you carry',
    'do you have',
    'in stock',
    'availability',
    ...browseInventoryPhrases,
  ],
  keywords: ['stock', 'carry', 'available', 'inventory'],
  negativeKeywords: [
    '2x',
    '2 x',
    '4x',
    '4 x',
    '6x',
    '6 x',
    'sku',
    'osb',
    'zip',
    'lvl',
    'tji',
    'simpson',
  ],
  shouldSkip(prompt) {
    return looksLikeProductLookup(prompt)
  },
  getReply(prompt, context = {}) {
    const isBrowseQuestion = isBrowseInventoryQuestion(prompt)

    return {
      kind: 'general',
      text: isBrowseQuestion
        ? `We stock a wide mix of lumber and building materials, including framing lumber, treated lumber, sheet goods like OSB, Zip, and Advantech, engineered lumber, Simpson hardware, decking, concrete, cedar/redwood items, and special-order materials. Ask by size, SKU, material, or project and I can narrow it down.`
        : `Yes, we can help check availability and current pricing. For the fastest confirmation, call ${storeInfo.phone} or text product questions, photos, screenshots, or measurements to ${storeInfo.textPhone}.`,
      deliveryPrompt: false,
      image: null,
      link: {
        label: `Text ${storeInfo.textPhone}`,
        url: storeInfo.textPhoneUrl,
      },
      products: isBrowseQuestion
        ? getFeaturedInventoryProducts(context.products)
        : [],
      quoteLines: [],
      selectedProduct: null,
    }
  },
}
