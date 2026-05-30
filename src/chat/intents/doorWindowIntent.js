import { storeInfo } from '../data/storeInfo.js'

export const doorWindowIntent = {
  name: 'doors-windows',
  strongKeywords: [
    'who can i order doors from',
    'how do i order doors',
    'do you have doors',
    'order doors',
    'custom doors',
    'custom windows',
  ],
  keywords: [
    'door',
    'doors',
    'window',
    'windows',
    'entry way',
    'entryway',
    'existing window',
    'new door',
  ],
  getReply() {
    return {
      kind: 'general',
      text: `Yes, we can order doors and custom windows to match the specs you need for an existing window or entryway, or help get specs on a new door or entryway for a new build. Please give us a call at ${storeInfo.phone} and ask for Dane or Joe, and they will get you taken care of.`,
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
