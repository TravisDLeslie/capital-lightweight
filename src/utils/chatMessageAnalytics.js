const chatSessionStorageKey = 'capital-lumber-chat-session-number'

function getChatSessionNumber() {
  const existingSessionId = window.localStorage.getItem(chatSessionStorageKey)
  const sessionId = Number(existingSessionId)

  if (Number.isFinite(sessionId) && sessionId > 0 && sessionId < 100000) {
    return sessionId
  }

  window.localStorage.removeItem(chatSessionStorageKey)
  return null
}

export function trackChatMessage(message, assistantResponse = '') {
  const cleanMessage = message.trim()
  const cleanAssistantResponse = assistantResponse.trim()

  if (!cleanMessage) return

  fetch('/api/chat-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: cleanMessage,
      assistantResponse: cleanAssistantResponse,
      sessionId: getChatSessionNumber(),
    }),
    keepalive: true,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.sessionId) {
        window.localStorage.setItem(chatSessionStorageKey, String(data.sessionId))
      }
    })
    .catch(() => {})
}
