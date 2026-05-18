import { storeInfo } from '../data/storeInfo.js'

export const returnsIntent = {
  name: 'returns',
  strongKeywords: [
    'return policy',
    'wrong material',
    'ordered too much',
    'can i bring this back',
    'left over material',
    'leftover material',
    'jobsite return',
    'stock return',
  ],
  keywords: ['return', 'returns', 'bring back', 'too much', 'leftover'],
  getReply() {
    return {
      kind: 'general',
      text: `We can return stock material if it is in the same condition as when it left our yard, has been wrapped or stored inside, and can be resold. If the item has been cut, nailed, painted, stained, damaged, or weathered, we cannot return it. Special order items have a 30% restock fee. We also do stock returns for leftover materials at jobsites. Call ${storeInfo.phone} or text photos/order details to ${storeInfo.textPhone} and we can help confirm the best next step.`,
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
