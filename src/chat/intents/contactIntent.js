import { storeInfo } from '../data/storeInfo.js'

export const contactIntent = {
  name: 'contact',
  strongKeywords: [
    'best number to reach you',
    'best number to call',
    'phone number',
    'what number should i call',
    'how do i reach you',
    'how can i contact you',
  ],
  keywords: ['call you', 'contact', 'reach you', 'number'],
  getReply() {
    return {
      kind: 'general',
      text: `The best number to reach us at is ${storeInfo.phone}. If you would rather send photos, screenshots, material lists, or product questions, you can text us at ${storeInfo.textPhone}.`,
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
