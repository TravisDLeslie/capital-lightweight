const sessionStorageKey = 'capital-lumber-session-id'

function getSessionId() {
  const existingSessionId = window.localStorage.getItem(sessionStorageKey)

  if (existingSessionId) {
    return existingSessionId
  }

  const nextSessionId = crypto.randomUUID()
  window.localStorage.setItem(sessionStorageKey, nextSessionId)
  return nextSessionId
}

export function trackSessionEvent(event) {
  const payload = {
    sessionId: getSessionId(),
    pageUrl: window.location.href,
    userAgent: window.navigator.userAgent,
    ...event,
  }

  fetch('/api/chat-event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {})
}
