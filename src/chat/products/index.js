import { getPriceCalculation } from '../calculators/priceMath.js'
import { getKnowledgeReply } from './knowledgeRules.js'
import { findProduct, findProductMatches } from './productSearch.js'
import {
  getFoundReplyText,
  getNotFoundReplyText,
  getRecommendationProducts,
} from './productRules.js'

function getQuoteLines(priceCalculation) {
  return priceCalculation
    ? priceCalculation.lines.map((line) => ({
        product: line.product,
        quantity: line.quantity,
      }))
    : []
}

export function getProductReply(prompt, products) {
  const productKnowledgeReply = getKnowledgeReply(prompt, products)

  if (productKnowledgeReply) {
    return {
      kind: 'product-knowledge',
      text: productKnowledgeReply.text,
      products: productKnowledgeReply.products,
      quoteLines: [],
      selectedProduct: null,
      showAllInitially: true,
    }
  }

  const product = findProduct(prompt, products)
  const matches = findProductMatches(prompt, products)
  const matchedProducts = matches.length ? matches : product ? [product] : []
  const priceCalculation = getPriceCalculation(prompt, products, matchedProducts)

  if (matchedProducts.length) {
    const isMultipleMatch = matchedProducts.length > 1
    const replyProducts = priceCalculation
      ? priceCalculation.products
      : matchedProducts

    return {
      kind: isMultipleMatch && !priceCalculation ? 'multiple-match' : 'exact-match',
      text: priceCalculation
        ? `${priceCalculation.text} I pulled that item up below so you can double-check stock and details.`
        : getFoundReplyText(prompt, matchedProducts),
      products: replyProducts,
      selectedProduct: priceCalculation
        ? priceCalculation.product
        : isMultipleMatch
          ? null
          : matchedProducts[0],
      quoteLines: getQuoteLines(priceCalculation),
      showAllInitially: prompt.toLowerCase().includes('osb'),
    }
  }

  const recommendations = getRecommendationProducts(prompt, products)
  const recommendationCalculation = getPriceCalculation(
    prompt,
    products,
    recommendations,
  )

  if (recommendationCalculation) {
    return {
      kind: 'exact-match',
      text: `${recommendationCalculation.text} I picked the closest matching stocked item for that math.`,
      products: recommendationCalculation.products,
      quoteLines: getQuoteLines(recommendationCalculation),
      selectedProduct: recommendationCalculation.product,
      showAllInitially: false,
    }
  }

  if (!recommendations.length) {
    return null
  }

  return {
    kind: 'recommendation',
    text: getNotFoundReplyText(prompt, recommendations),
    products: recommendations,
    quoteLines: [],
    selectedProduct: null,
    showAllInitially: false,
  }
}
