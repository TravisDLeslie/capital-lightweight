import { storeInfo } from '../data/storeInfo.js'

export const urgentIntent = {
  name: 'urgent',
  strongKeywords: [
    'need it today',
    'need asap',
    'crew is waiting',
    'jobsite emergency',
    'need material now',
  ],
  keywords: ['asap', 'urgent', 'hotshot', 'right now', 'emergency'],
  getReply() {
    return {
      kind: 'general',
      text: `Availability and timing depend on stock, material readiness, truck schedule, location, and unload type. For the fastest help, call the store at ${storeInfo.phone} so we can check the next real option.`,
      deliveryPrompt: false,
      image: null,
      link: {
        label: `Call ${storeInfo.phone}`,
        url: storeInfo.phoneUrl,
      },
      products: [],
      quoteLines: [],
      selectedProduct: null,
    }
  },
}
