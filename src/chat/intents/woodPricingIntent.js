import { storeInfo } from '../data/storeInfo.js'

function isCedarRedwoodComparison(prompt) {
  const text = prompt.toLowerCase()

  return (
    text.includes('cedar') &&
    text.includes('redwood') &&
    (text.includes('difference') ||
      text.includes(' vs ') ||
      text.includes('versus') ||
      text.includes('compare'))
  )
}

export const woodPricingIntent = {
  name: 'wood-pricing',
  strongKeywords: [
    'how much is cedar going for',
    'cedar price',
    'price of cedar',
    'price difference between cedar and redwood',
    'cedar vs redwood price',
    'redwood vs cedar price',
  ],
  keywords: ['cedar going', 'cedar pricing', 'redwood pricing'],
  getReply(prompt) {
    if (isCedarRedwoodComparison(prompt)) {
      return {
        kind: 'general',
        text: 'For a 2x6-16 comparison, Cedar is about $77 and Con Heart Redwood is about $66, so Cedar is roughly $11 more per board. Pricing can move, so call us to confirm current stock and price before ordering.',
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
    }

    return {
      kind: 'general',
      text: 'Right now, a 2x4-8 cedar is going for roughly $12. Pricing can move, so call us to confirm current stock and price before ordering.',
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
