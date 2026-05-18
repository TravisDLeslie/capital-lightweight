import { paymentInfo } from '../data/paymentInfo.js'
import { storeInfo } from '../data/storeInfo.js'

export const paymentsIntent = {
  name: 'payments',
  strongKeywords: [
    'how can i pay',
    'payment methods',
    'do you take venmo',
    'pay over the phone',
    'credit card over phone',
    'pay by phone',
    'do you take checks',
  ],
  keywords: [
    'payment',
    'pay',
    'paid',
    'cash',
    'venmo',
    'credit card',
    'card',
    'check',
    'cheque',
    'invoice',
    'billing',
  ],
  getReply() {
    return {
      kind: 'general',
      text: `We take ${paymentInfo.methods.join(', ')}. ${paymentInfo.checkNote} You can always give us a call at ${storeInfo.phone}.`,
      link: {
        label: `Call ${storeInfo.phone}`,
        url: storeInfo.phoneUrl,
      },
    }
  },
}
