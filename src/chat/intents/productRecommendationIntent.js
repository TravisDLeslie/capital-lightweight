import { storeInfo } from '../data/storeInfo.js'

export const productRecommendationIntent = {
  name: 'product-recommendation',
  strongKeywords: [
    'what should i use',
    'best material for',
    'cheapest option',
    'good option for',
    'what wood should i use',
    'best fence board',
    'best decking material',
  ],
  keywords: ['recommend', 'recommendation', 'best option', 'what material'],
  getReply() {
    return {
      kind: 'general',
      text: `We can help recommend materials based on the project, budget, exposure, look, and what is available. Send the project details, measurements, or photos, or text them to ${storeInfo.textPhone}, and we can point you in the right direction.`,
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
