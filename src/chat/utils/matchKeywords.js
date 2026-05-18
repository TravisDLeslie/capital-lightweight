import { normalizeQuery } from '../products/productSearch.js'

export function hasAnyKeyword(prompt, keywords = []) {
  const normalizedPrompt = normalizeQuery(prompt)

  return keywords.some((keyword) =>
    normalizedPrompt.includes(normalizeQuery(keyword)),
  )
}

export function scoreKeywords(prompt, intent) {
  const normalizedPrompt = normalizeQuery(prompt)
  let score = 0

  ;(intent.keywords || []).forEach((keyword) => {
    if (normalizedPrompt.includes(normalizeQuery(keyword))) score += 2
  })

  ;(intent.strongKeywords || []).forEach((keyword) => {
    if (normalizedPrompt.includes(normalizeQuery(keyword))) score += 4
  })

  ;(intent.negativeKeywords || []).forEach((keyword) => {
    if (normalizedPrompt.includes(normalizeQuery(keyword))) score -= 4
  })

  return score
}
