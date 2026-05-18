import { getCalculatorReply } from './calculators/index.js'
import { getIntentReply } from './intents/index.js'
import { getLLMReply } from './llm/llmReply.js'
import { getProductReply } from './products/index.js'
import { normalizePrompt } from './utils/normalizePrompt.js'

function normalizeReply(reply) {
  if (!reply) return null

  return {
    ...reply,
    kind: reply.kind || 'general',
    text: reply.text || '',
    deliveryPrompt: reply.deliveryPrompt || false,
    image: reply.image || null,
    link: reply.link || null,
    products: reply.products || [],
    quoteLines: reply.quoteLines || [],
    selectedProduct: reply.selectedProduct || null,
  }
}

export function getFallbackReply(prompt = '') {
  console.log('Unknown prompt:', prompt)

  return {
    kind: 'fallback',
    text: "I'm not totally sure I understood that, but I can help. Ask about products, delivery, estimating, contractor support, or text photos/questions to 208-991-9970.",
    deliveryPrompt: false,
    image: null,
    link: null,
    products: [],
    quoteLines: [],
    selectedProduct: null,
  }
}

export async function getChatReply(prompt, products = [], context = {}) {
  const cleanPrompt = normalizePrompt(prompt)

  const calculatorReply = getCalculatorReply(cleanPrompt)
  if (calculatorReply) return normalizeReply(calculatorReply)

  const intentReply = getIntentReply(cleanPrompt, {
    ...context,
    products,
  })
  if (intentReply) return normalizeReply(intentReply)

  const productReply = getProductReply(cleanPrompt, products)
  if (productReply) return normalizeReply(productReply)

  const llmReply = await getLLMReply(cleanPrompt, context)
  if (llmReply) return normalizeReply(llmReply)

  return getFallbackReply(cleanPrompt)
}
