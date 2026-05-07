import { findProduct, findProductMatches } from '../utils/productSearch.js'
import { getGeneralQuestionReply } from './generalQuestions.js'
import { getKnowledgeReply } from './knowledgeRules.js'
import { getPriceCalculation } from './priceMath.js'
import {
  getFoundReplyText,
  getNotFoundReplyText,
  getRecommendationProducts,
} from './productRules.js'

export function getChatReply(prompt, products) {
  const cleanPrompt = prompt.trim()
  const generalQuestionReply = getGeneralQuestionReply(cleanPrompt)

  if (generalQuestionReply) {
    return {
      kind: 'general',
      image: generalQuestionReply.image,
      text: generalQuestionReply.text,
      link: generalQuestionReply.link,
      products: [],
      quoteLines: [],
      selectedProduct: null,
      showAllInitially: false,
    }
  }

  const productKnowledgeReply = getKnowledgeReply(cleanPrompt, products)

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

  const product = findProduct(cleanPrompt, products)
  const matches = findProductMatches(cleanPrompt, products)
  const matchedProducts = matches.length ? matches : product ? [product] : []
  const priceCalculation = getPriceCalculation(cleanPrompt, products, matchedProducts)

  if (matchedProducts.length) {
    const isMultipleMatch = matchedProducts.length > 1
    const replyProducts = priceCalculation
      ? priceCalculation.products
      : matchedProducts

    return {
      kind: isMultipleMatch && !priceCalculation ? 'multiple-match' : 'exact-match',
      text: priceCalculation
        ? `${priceCalculation.text} I pulled that item up below so you can double-check stock and details.`
        : getFoundReplyText(cleanPrompt, matchedProducts),
      products: replyProducts,
      selectedProduct: priceCalculation
        ? priceCalculation.product
        : isMultipleMatch
          ? null
          : matchedProducts[0],
      quoteLines: priceCalculation
        ? priceCalculation.lines.map((line) => ({
            product: line.product,
            quantity: line.quantity,
          }))
        : [],
      showAllInitially: cleanPrompt.toLowerCase().includes('osb'),
    }
  }

  const recommendations = getRecommendationProducts(cleanPrompt, products)
  const recommendationCalculation = getPriceCalculation(
    cleanPrompt,
    products,
    recommendations,
  )

  if (recommendationCalculation) {
    return {
      kind: 'exact-match',
      text: `${recommendationCalculation.text} I picked the closest matching stocked item for that math.`,
      products: recommendationCalculation.products,
      quoteLines: recommendationCalculation.lines.map((line) => ({
        product: line.product,
        quantity: line.quantity,
      })),
      selectedProduct: recommendationCalculation.product,
      showAllInitially: false,
    }
  }

  return {
    kind: 'recommendation',
    text: getNotFoundReplyText(cleanPrompt, recommendations),
    products: recommendations,
    quoteLines: [],
    selectedProduct: null,
    showAllInitially: false,
  }
}
