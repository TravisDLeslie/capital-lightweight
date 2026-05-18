export function normalizePrompt(prompt = '') {
  return prompt.trim().replace(/\s+/g, ' ')
}
