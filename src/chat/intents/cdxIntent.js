import { normalizeQuery } from '../products/productSearch.js'

const stockedCdxSizes = ['3/8', '1/2', '5/8', '3/4']

function getStockedCdxProducts(products = []) {
  return products.filter((product) => {
    const normalizedName = normalizeQuery(product.name)
    const normalizedGrade = normalizeQuery(product.grade)

    return (
      product.category === 'Sheet Goods' &&
      normalizedGrade.includes('cdxplywood') &&
      !normalizedGrade.includes('treated') &&
      stockedCdxSizes.some((size) => normalizedName.includes(size))
    )
  })
}

function getSpecificCdxProduct(prompt, products = []) {
  const normalizedPrompt = normalizeQuery(prompt)

  const requestedSize = stockedCdxSizes.find((size) =>
    normalizedPrompt.includes(size),
  )

  if (!requestedSize) return null

  return products.find((product) => normalizeQuery(product.name).includes(requestedSize))
}

export const cdxIntent = {
  name: 'cdx',
  strongKeywords: [
    '3/4 cdx',
    '1/2 cdx',
    '5/8 cdx',
    '3/8 cdx',
    '7/8 cdx',
    '1-1/8 cdx',
    '1 1/8 cdx',
    'do you have cdx',
    'do you stock cdx',
    'what about cdx',
  ],
  keywords: ['cdx', 'cdx plywood'],
  getReply(prompt, context = {}) {
    const products = getStockedCdxProducts(context.products)
    const selectedProduct = getSpecificCdxProduct(prompt, products) || products[0] || null

    return {
      kind: 'general',
      text: 'Yes, we stock CDX on the ground for prompt pickup in 3/8, 1/2, 5/8, and 3/4. We can also get 7/8 and 1-1/8 CDX, as well as tongue and groove options, in roughly 1-2 days max. Here are the stocked CDX options we have on the ground:',
      deliveryPrompt: false,
      image: null,
      link: null,
      products,
      quoteLines: [],
      selectedProduct,
    }
  },
}
