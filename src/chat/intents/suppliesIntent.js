import { storeInfo } from '../data/storeInfo.js'

const replyShape = (text) => ({
  kind: 'general',
  text,
  deliveryPrompt: false,
  image: null,
  link: {
    label: `Call ${storeInfo.phone}`,
    url: storeInfo.phoneUrl,
  },
  products: [],
  quoteLines: [],
  selectedProduct: null,
})

function mentionsAny(text, terms) {
  return terms.some((term) => text.includes(term))
}

export const suppliesIntent = {
  name: 'supplies',
  strongKeywords: [
    'sawzall blades',
    'sawzall blade',
    'reciprocating saw blades',
    'do you guys sell screws',
    'do you sell screws',
    'do you have caulk',
    'do you carry caulk',
    'decorative hangers',
    'pergola hangers',
    'patio cover hangers',
  ],
  keywords: [
    'screws',
    'caulk',
    'adhesive',
    'adhesives',
    'anchor epoxy',
    'au-1',
    'dap',
    'machine screws',
    'wood screws',
    'lags',
  ],
  getReply(prompt) {
    const text = prompt.toLowerCase()

    if (mentionsAny(text, ['sawzall blade', 'sawzall blades', 'reciprocating saw'])) {
      return replyShape(
        'Yes, we carry a wide variety of Sawzall blades for different types of applications. We also have bulk Sawzall blades that contractors love.',
      )
    }

    if (
      mentionsAny(text, [
        'decorative hanger',
        'decorative hangers',
        'pergola',
        'pregola',
        'patio cover',
      ])
    ) {
      return replyShape(
        'Yes, we have decorative hangers for both standard-size wood and rough-sawn wood. We can also get most Simpson items in about 1-3 days on average.',
      )
    }

    if (mentionsAny(text, ['caulk', 'adhesive', 'adhesives', 'anchor epoxy', 'au-1', 'dap'])) {
      return replyShape(
        'Yes, we have a wide range of caulk and adhesives for doors and windows, plus anchor epoxy, AU-1, DAP, Simpson products, and more.',
      )
    }

    return replyShape(
      'Yes, we carry general T-25 screws by the pound from 1-5/8 in screws all the way up to 6 in screws. We also have structural screws, structural SDWS screws, timber screws, machine screws, small wood screws, lags, and much more.',
    )
  },
}
