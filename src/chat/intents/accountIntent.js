import { servicesInfo } from '../data/servicesInfo.js'
import { storeInfo } from '../data/storeInfo.js'

export const accountIntent = {
  name: 'account',
  strongKeywords: [
    'charge account',
    'open account',
    'credit application',
    'net 30',
    'terms',
    'account setup',
  ],
  keywords: ['credit account', 'contractor account', 'billing account'],
  getReply() {
    return {
      kind: 'general',
      text: `Yes, we work with contractors and can help with account setup, job pricing, takeoffs, and delivery support. Call ${storeInfo.phone} for account details or email ${servicesInfo.accountingEmail}.`,
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
