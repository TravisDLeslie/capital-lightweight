import { storeInfo } from '../data/storeInfo.js'

export const greetingIntent = {
  name: 'greeting',
  strongKeywords: [
    'hi',
    'hello',
    'hey',
    'good morning',
    'good afternoon',
    'are you there',
  ],
  keywords: ['howdy', 'good evening'],
  negativeKeywords: ['this', 'which', 'thing', 'ship', 'white', 'high'],
  getReply() {
    return {
      kind: 'general',
      text: `Hi, welcome to Capital Lumber. You can ask me about products, delivery, estimating, hours, contractor support, or text photos and product questions to ${storeInfo.textPhone}.`,
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
