import { storeInfo } from '../data/storeInfo.js'

export const orderingIntent = {
  name: 'ordering',
  strongKeywords: [
    'online ordering',
    'order online',
    'buy online',
    'purchase online',
    'place order online',
    'website order',
    'online order',
    'cart checkout',
    'checkout online',
    'phone order',
    'order over phone',
    'call in order',
    'call and order',
    'in person',
    'come in',
    'visit',
    'stop by',
  ],
  keywords: ['online ordering', 'order online', 'phone order', 'in person'],
  getReply(prompt) {
    const isInPersonQuestion =
      prompt.includes('in person') ||
      prompt.includes('come in') ||
      prompt.includes('visit') ||
      prompt.includes('stop by')

    return {
      kind: 'general',
      text: isInPersonQuestion
        ? `You are welcome to visit in person, call ${storeInfo.phone}, or email your quote/request. We can help with materials, pricing, and quotes at the counter. We are at ${storeInfo.address} near 31st and State.`
        : `We do not currently offer online ordering. You can email your quote/request, call ${storeInfo.phone}, or visit us in person at ${storeInfo.address} near 31st and State.`,
      link: {
        label: `Call ${storeInfo.phone}`,
        url: storeInfo.phoneUrl,
      },
    }
  },
}
