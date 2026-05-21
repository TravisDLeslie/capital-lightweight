/* global process */

import fs from 'node:fs'
import path from 'node:path'

const defaultBaseId = 'appQsPzumhfurpdhA'
const defaultTableId = 'tblLZws11czzxjHqJ'

function loadLocalEnv() {
  if (process.env.VERCEL_ENV) return

  const envPath = path.join(process.cwd(), '.env.local')

  if (!fs.existsSync(envPath)) return

  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith('#')) return

      const separatorIndex = trimmedLine.indexOf('=')

      if (separatorIndex === -1) return

      const key = trimmedLine.slice(0, separatorIndex)
      const value = trimmedLine.slice(separatorIndex + 1)

      if (!process.env[key]) {
        process.env[key] = value
      }
    })
}

function getConfig() {
  loadLocalEnv()

  return {
    baseId:
      process.env.AIRTABLE_CHAT_BASE_ID ||
      process.env.AIRTABLE_BASE_ID ||
      defaultBaseId,
    tableId: process.env.AIRTABLE_CHAT_TABLE_ID || defaultTableId,
    token: process.env.AIRTABLE_TOKEN,
  }
}

async function getNextSessionId({ baseId, tableId, token }) {
  const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`)
  url.searchParams.set('maxRecords', '1')
  url.searchParams.set('sort[0][field]', 'Session ID')
  url.searchParams.set('sort[0][direction]', 'desc')

  const airtableResponse = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!airtableResponse.ok) {
    throw new Error(await airtableResponse.text())
  }

  const data = await airtableResponse.json()
  const latestSessionId = Number(data.records?.[0]?.fields?.['Session ID'] || 0)

  return latestSessionId + 1
}

function buildFields(message, sessionId) {
  return {
    'Session ID': sessionId,
    'Chat Messages': message.message,
    'Assistant Response': message.assistantResponse || '',
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { baseId, tableId, token } = getConfig()

  if (!token) {
    return response.status(202).json({ skipped: true })
  }

  try {
    const message = request.body || {}

    if (!message.message) {
      return response.status(400).json({ error: 'Missing chat message' })
    }

    const requestedSessionId = Number(message.sessionId)
    const sessionId = Number.isFinite(requestedSessionId) && requestedSessionId > 0
      ? requestedSessionId
      : await getNextSessionId({ baseId, tableId, token })

    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{ fields: buildFields(message, sessionId) }],
          typecast: true,
        }),
      },
    )

    if (!airtableResponse.ok) {
      const errorMessage = await airtableResponse.text()
      return response.status(airtableResponse.status).json({ error: errorMessage })
    }

    return response.status(200).json({ ok: true, sessionId })
  } catch (error) {
    return response.status(500).json({ error: error.message })
  }
}
