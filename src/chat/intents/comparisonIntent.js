import { storeInfo } from '../data/storeInfo.js'
import { normalizeQuery } from '../products/productSearch.js'

function getSheetGoods(products = []) {
  return products
    .filter((product) => product.category === 'Sheet Goods')
    .slice(0, 6)
}

function isOsbPlywoodQuestion(prompt) {
  const normalizedPrompt = normalizeQuery(prompt)

  return (
    normalizedPrompt.includes('osb') &&
    normalizedPrompt.includes('plywood')
  )
}

export const comparisonIntent = {
  name: 'comparison',
  strongKeywords: [
    'cedar vs redwood',
    'treated vs cedar',
    'composite vs wood',
    'osb vs plywood',
    'zip vs osb',
    'lvl vs beam',
    'tji vs dimensional lumber',
  ],
  keywords: [' vs ', 'versus', 'compare', 'difference between'],
  getReply(prompt, context = {}) {
    if (isOsbPlywoodQuestion(prompt)) {
      return {
        kind: 'general',
        text: `OSB and plywood can both be used as structural panels, but they behave a little differently. OSB is usually the better value for wall and roof sheathing when the plans allow it, and it gives consistent panel strength at a lower price point. Plywood is built from cross-laminated wood veneers, so it is often preferred when customers want better edge holding, lighter weight, better moisture tolerance during handling, or a cleaner panel for certain exposed or utility uses. For subfloors, roofs, shear walls, or rated assemblies, the plans and panel stamp should guide the final choice. If you tell us the use, thickness, and whether it is wall, roof, floor, or exterior exposure, we can help pick the right panel.`,
        deliveryPrompt: false,
        image: null,
        link: {
          label: `Call ${storeInfo.phone}`,
          url: storeInfo.phoneUrl,
        },
        products: getSheetGoods(context.products),
        quoteLines: [],
        selectedProduct: null,
      }
    }

    return {
      kind: 'general',
      text: `We can help compare those options based on the project, budget, availability, appearance, exposure, and performance. For project-specific advice, call ${storeInfo.phone} or text photos and details to ${storeInfo.textPhone}.`,
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
