import { storeInfo } from '../data/storeInfo.js'

export const servicesIntent = {
  name: 'services',
  strongKeywords: [
    'what do you guys do',
    'what can you help with',
    'do you do takeoffs',
    'do you help contractors',
  ],
  keywords: ['services', 'help contractors', 'what do you do'],
  getReply() {
    return {
      kind: 'general',
      text: `We help with lumber and building materials, contractor support, material lists and takeoffs, delivery, special orders, and identifying materials by text or photo. You can call ${storeInfo.phone} or text photos/questions to ${storeInfo.textPhone}.`,
      deliveryPrompt: false,
      image: null,
      link: {
        label: `Text ${storeInfo.textPhone}`,
        url: storeInfo.textPhoneUrl,
      },
      products: [],
      quoteLines: [],
      selectedProduct: null,
    }
  },
}
