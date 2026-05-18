import { getAvailability } from '../../utils/availability.js'
import { normalizeQuery } from './productSearch.js'

function allProductsAre(products, category) {
  return products.every((product) => product.category === category)
}

function allProductsStartWith(products, value) {
  return products.every((product) =>
    product.name.toLowerCase().startsWith(value.toLowerCase()),
  )
}

function getRequestedItemLabel(prompt) {
  const cleanedPrompt = prompt
    .toLowerCase()
    .replace(/[?!.]/g, '')
    .replace(/\boyu\b/g, 'you')
    .replace(/\bu\b/g, 'you')
    .replace(/\bdo you\b/g, '')
    .replace(/\bcan i\b/g, '')
    .replace(/\bcould i\b/g, '')
    .replace(/\bdo yall\b/g, '')
    .replace(/\bdo you guys\b/g, '')
    .replace(/\bguys\b/g, '')
    .replace(/\bstock\b/g, '')
    .replace(/\bcarry\b/g, '')
    .replace(/\bhave\b/g, '')
    .replace(/\bget\b/g, '')
    .replace(/\bneed\b/g, '')
    .replace(/\bprice\b/g, '')
    .replace(/\bpricing\b/g, '')
    .replace(/\bany\b/g, '')
    .replace(/\bsome\b/g, '')
    .replace(/\ba\b/g, '')
    .replace(/\ban\b/g, '')
    .replace(/\bof\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const words = cleanedPrompt.split(' ').filter(Boolean)

  if (!words.length) {
    return prompt
  }

  return words.slice(-3).join(' ')
}

export function getFoundReplyText(prompt, matchedProducts) {
  const normalizedPrompt = normalizeQuery(prompt)

  const isTwoByFourQuestion =
    normalizedPrompt.includes('2x4') &&
    matchedProducts.length > 1 &&
    allProductsStartWith(matchedProducts, '2x4')

  if (isTwoByFourQuestion) {
    return "Yes, we stock 2x4s in 8' through 16' lengths in a #1 grade. They're Doug Fir-Larch boards, which are a great fit for Idaho and the Treasure Valley climate. We also keep common NPS pre-cut studs on hand."
  }

  if (normalizedPrompt.includes('zip')) {
    return 'Yes, we carry Zip panels, and I also pulled up Advantech options since customers asking for Zip are often comparing premium sheathing and subfloor choices.'
  }

  if (matchedProducts.length === 1) {
    const [product] = matchedProducts
    const availability = getAvailability(product)

    if (availability.type === 'lead-time') {
      return `We do not stock ${product.name} in the yard, but it is available with a ${availability.label}. I pulled it up below so you can see the details.`
    }

    if (availability.type === 'custom-order') {
      const leadTime = availability.label.replace(' custom order', 's')

      return `${product.name} is handled as a custom order. Typical lead time is ${leadTime}, and the counter can help confirm profile, species, and pricing.`
    }

    if (product.category === 'Decking') {
      return `Yes, we carry ${product.name}. I pulled it up below so you can review the material, then we can confirm color, profile, length, and current pricing.`
    }

    if (
      product.category === 'Dimensional Lumber' &&
      product.grade === '#1 DF-L' &&
      product.name.toLowerCase().startsWith('2x4-')
    ) {
      return `Yes, we stock ${product.name}. We also stock other 2x4 #1 DF-L lengths such as 10', 12', 14', and 16', plus common NPS pre-cut studs.`
    }

    return `Yes, we stock ${product.name}. It is ${product.grade}, currently showing ${product.stock} in stock at ${product.location}.`
  }

  if (allProductsAre(matchedProducts, 'Sheet Goods')) {
    return 'Yes, we stock several sheet goods options. I pulled the common OSB, T&G, Zip, and Advantech panels so you can compare thickness, price, and availability.'
  }

  if (allProductsAre(matchedProducts, 'Structural Hardware')) {
    return 'Yes, we stock common Simpson Strong-Tie hardware. Here are the closest hanger and connector options we have in the online product list.'
  }

  if (allProductsAre(matchedProducts, 'Holdowns & Tension Ties')) {
    return 'Yes, we can help with Simpson Strong-Tie holdowns and tension ties. I pulled that bucket up below, but the plans or engineer should control the final model, fasteners, and anchor requirements.'
  }

  if (allProductsAre(matchedProducts, 'Engineered Lumber')) {
    return 'Yes, we stock engineered lumber options sold by the foot. I pulled the TJI and Microllam/LVL sizes so you can compare heights and pricing.'
  }

  if (allProductsAre(matchedProducts, 'Timbers & Beams')) {
    return 'Yes, we stock common fir beams and timbers. #1 is the cleaner, stronger yard-stock choice in most of these sizes, while #2 can be a good value when the plans allow it.'
  }

  if (allProductsAre(matchedProducts, 'Decking')) {
    return 'Yes, we stock decking material options across composite, PVC, thermally modified wood, and natural wood. I pulled the main lines so customers can compare brand, species, and style before we confirm color and lengths.'
  }

  if (allProductsAre(matchedProducts, 'Concrete & Sacked Goods')) {
    return 'Yes, we stock concrete and sacked goods. We carry 60 lb and 80 lb 4000 PSI ready mix, plus a 50 lb fast-setting ready mix when the job needs a quicker set.'
  }

  return 'Yes, we stock a few options that match that ask. Here are the closest products I found.'
}

export function getRecommendationProducts(prompt, products) {
  const normalizedPrompt = normalizeQuery(prompt)

  if (
    normalizedPrompt.includes('plywood') ||
    normalizedPrompt.includes('sheet') ||
    normalizedPrompt.includes('panel') ||
    normalizedPrompt.includes('subfloor') ||
    normalizedPrompt.includes('osb') ||
    normalizedPrompt.includes('zip') ||
    normalizedPrompt.includes('advantech')
  ) {
    return products
      .filter((product) => product.category === 'Sheet Goods')
      .slice(0, 4)
  }

  if (
    normalizedPrompt.includes('holdown') ||
    normalizedPrompt.includes('holddown') ||
    normalizedPrompt.includes('tensiontie') ||
    normalizedPrompt.includes('decktensiontie') ||
    normalizedPrompt.includes('straptie') ||
    normalizedPrompt.includes('purlinanchor')
  ) {
    return products
      .filter((product) => product.category === 'Holdowns & Tension Ties')
      .slice(0, 4)
  }

  if (
    normalizedPrompt.includes('hanger') ||
    normalizedPrompt.includes('simpson') ||
    normalizedPrompt.includes('strongtie') ||
    normalizedPrompt.includes('connector')
  ) {
    return products
      .filter((product) => product.category === 'Structural Hardware')
      .slice(0, 4)
  }

  if (
    normalizedPrompt.includes('beam') ||
    normalizedPrompt.includes('timber') ||
    normalizedPrompt.includes('joist') ||
    normalizedPrompt.includes('lvl') ||
    normalizedPrompt.includes('tji') ||
    normalizedPrompt.includes('microllam')
  ) {
    const beamProducts = products.filter(
      (product) => product.category === 'Timbers & Beams',
    )

    if (
      (normalizedPrompt.includes('beam') ||
        normalizedPrompt.includes('timber')) &&
      beamProducts.length
    ) {
      return beamProducts.slice(0, 4)
    }

    return products
      .filter((product) => product.category === 'Engineered Lumber')
      .slice(0, 4)
  }

  if (
    normalizedPrompt.includes('deck') ||
    normalizedPrompt.includes('decking') ||
    normalizedPrompt.includes('trex') ||
    normalizedPrompt.includes('timbertech') ||
    normalizedPrompt.includes('cedar') ||
    normalizedPrompt.includes('redwood')
  ) {
    return products
      .filter((product) => product.category === 'Decking')
      .slice(0, 4)
  }

  if (
    normalizedPrompt.includes('concrete') ||
    normalizedPrompt.includes('readymix') ||
    normalizedPrompt.includes('sackedgoods') ||
    normalizedPrompt.includes('cement') ||
    normalizedPrompt.includes('sakrete')
  ) {
    return products
      .filter((product) => product.category === 'Concrete & Sacked Goods')
      .slice(0, 4)
  }

  if (
    normalizedPrompt.includes('treated') ||
    normalizedPrompt.includes('pressuretreated') ||
    normalizedPrompt.includes('post') ||
    normalizedPrompt.includes('fence')
  ) {
    return products
      .filter((product) => product.category === 'Treated Lumber')
      .slice(0, 4)
  }

  return []
}

export function getNotFoundReplyText(prompt, recommendations = []) {
  const requestedItemLabel = getRequestedItemLabel(prompt)
  const hasRecommendations = recommendations.length > 0

  if (!hasRecommendations) {
    return `I’m not seeing "${requestedItemLabel}" in our online product list yet. That does not always mean we cannot get it. Give us a call at 208-343-5481, email travis@capitallumber.co, or stop by the yard and we can check stock, special order options, and current pricing.`
  }

  const recommendationNames = recommendations
    .slice(0, 3)
    .map((product) => product.name)
    .join(', ')

  return `I’m not seeing an exact match for "${requestedItemLabel}" in our online product list yet. The closest stocked items I would check first are ${recommendationNames}. If that is not what you need, give us a call at 208-343-5481 or email travis@capitallumber.co and we can check stock, special order options, and current pricing.`
}
