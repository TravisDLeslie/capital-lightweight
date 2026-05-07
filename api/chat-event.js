/* global process */

const airtableBaseId = process.env.AIRTABLE_BASE_ID || 'appQsPzumhfurpdhA'
const airtableTableId = process.env.AIRTABLE_TABLE_ID || 'tblYZeiM5jfOM1Ev7'

function getFieldValue(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(', ')
  }

  return value
}

function buildFields(event) {
  const fieldMap = {
    'Session ID': event.sessionId,
    'Event Type': event.eventType,
    Prompt: event.prompt,
    'Response Type': event.responseType,
    'Matched Products': getFieldValue(event.matchedProducts),
    'Selected Product': event.selectedProduct,
    'Added To Quote': event.addedToQuote,
    'Downloaded PDF': event.downloadedPdf,
    'Quote Title': event.quoteTitle,
    'Quote Total': event.quoteTotal,
    'Page URL': event.pageUrl,
    'User Agent': event.userAgent,
  }

  return Object.fromEntries(
    Object.entries(fieldMap).filter(([, value]) => value !== undefined && value !== ''),
  )
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.AIRTABLE_TOKEN) {
    return response.status(202).json({ skipped: true })
  }

  try {
    const event = request.body || {}
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{ fields: buildFields(event) }],
          typecast: true,
        }),
      },
    )

    if (!airtableResponse.ok) {
      const message = await airtableResponse.text()
      return response.status(airtableResponse.status).json({ error: message })
    }

    return response.status(200).json({ ok: true })
  } catch (error) {
    return response.status(500).json({ error: error.message })
  }
}
