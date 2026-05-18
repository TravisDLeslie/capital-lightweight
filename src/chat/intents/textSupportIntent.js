import { storeInfo } from '../data/storeInfo.js'

const textSupportKeywords = [
  'can i text',
  'text you',
  'text us',
  'send a photo',
  'send photo',
  'send a picture',
  'send picture',
  'send an image',
  'send image',
  'send screenshot',
  'send a screenshot',
  'picture of',
  'photo of',
  'image of',
  'identify this',
  'identify material',
  'identify product',
  'verify material',
  'verify product',
  'product verification',
  'material help',
  'what is this',
  'does this match',
  'can i show you',
]

export const textSupportIntent = {
  name: 'text-support',
  strongKeywords: textSupportKeywords,
  keywords: ['text', 'photo', 'picture', 'image', 'screenshot'],
  getReply() {
    return {
      kind: 'general',
      text: `Need help identifying a material or have a product question? Text us photos, screenshots, measurements, plans, or product questions at ${storeInfo.textPhone}. We can help verify materials, answer questions, and point you in the right direction.`,
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
