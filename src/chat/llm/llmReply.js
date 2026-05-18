import { systemPrompt } from './systemPrompt.js'

function getEndpoint() {
  return import.meta.env.VITE_LLM_REPLY_ENDPOINT || ''
}

function normalizeLLMResponse(data) {
  if (!data) return null

  if (typeof data === 'string') {
    return data
  }

  return data.text || data.reply || data.message || null
}

export async function getLLMReply(prompt, context = {}) {
  const endpoint = getEndpoint()

  if (!endpoint) {
    return null
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context,
        prompt,
        systemPrompt,
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const text = normalizeLLMResponse(data)

    if (!text) {
      return null
    }

    return {
      kind: 'llm',
      deliveryPrompt: false,
      image: null,
      link: null,
      products: [],
      quoteLines: [],
      selectedProduct: null,
      text,
    }
  } catch {
    return null
  }
}
