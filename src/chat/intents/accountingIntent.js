import { storeInfo } from '../data/storeInfo.js'

const accountingEmail = 'accounting@capitallumber.co'

export const accountingIntent = {
  name: 'accounting',
  strongKeywords: [
    'who handles receivables',
    'who can i contact in accounting',
    'accounts receivable',
    'receivables',
    'pay my bill',
    'pay a bill',
    'billing question',
    'accounting question',
  ],
  keywords: [
    'accounting',
    'billing',
    'bill',
    'invoice',
    'statement',
    'receivable',
    'receivables',
  ],
  getReply() {
    return {
      kind: 'general',
      text: `For billing, accounting, receivables, or paying a bill, please email ${accountingEmail} or call ${storeInfo.phone} and ask for McKenzie.`,
      deliveryPrompt: false,
      image: null,
      link: {
        label: `Email ${accountingEmail}`,
        url: `mailto:${accountingEmail}`,
      },
      products: [],
      quoteLines: [],
      selectedProduct: null,
    }
  },
}
