import {
  findDeliveryCity,
  findDeliveryArea,
  findDeliveryZip,
  getDeliveryCityEstimate,
  getDeliveryPriceText,
  getDeliveryZone,
  getFreeStandardDeliveryNote,
} from '../../utils/deliveryPricing.js'
import { deliveryInfo } from '../data/deliveryInfo.js'
import { storeInfo } from '../data/storeInfo.js'
import { normalizeQuery } from '../products/productSearch.js'

const lower = (value = '') => value.toLowerCase()

const includesAny = (text, phrases) =>
  phrases.some((phrase) => text.includes(phrase))

const asksDeliveryTiming = (text) =>
  includesAny(text, [
    'next delivery',
    'soonest delivery',
    'when can you deliver',
    'how soon can you deliver',
    'deliver today',
    'delivery today',
    'deliver tomorrow',
    'delivery tomorrow',
    'next available delivery',
    'how fast can you deliver',
    'how fast can you ship',
    'when can you ship',
    'can you get it out today',
    'can you get it delivered today',
    'crew is waiting',
    'need it asap',
    'need material now',
    'jobsite emergency',
    'hotshot',
  ])

const asksDeliveryPricing = (text) =>
  includesAny(text, [
    'delivery cost',
    'delivery price',
    'delivery fee',
    'how much is delivery',
    'what does delivery cost',
    'shipping cost',
    'shipping price',
    'shipping fee',
    'how much is shipping',
    'what does shipping cost',
    'how much to deliver',
    'price to deliver',
    'cost to deliver',
    'forklift delivery cost',
    'hand unload price',
    'dump delivery price',
  ])

const asksUnloadType = (text) =>
  includesAny(text, [
    'forklift unload',
    'truck mounted forklift',
    'moffett',
    'hand unload',
    'hand-unload',
    'dump delivery',
    'dumped',
    'can you dump',
    'curbside',
    'driveway delivery',
    'jobsite delivery',
    'unload type',
  ])

const asksJobsiteAccess = (text) =>
  includesAny(text, [
    'narrow driveway',
    'alley',
    'can your truck fit',
    'truck fit',
    'over gravel',
    'gravel driveway',
    'backyard',
    'by the garage',
    'in the street',
    'place it',
    'where can you put it',
    'tight access',
    'limited access',
  ])

const asksWhereWeDeliver = (text) =>
  includesAny(text, [
    'where do you deliver',
    'delivery area',
    'how far do you deliver',
    'deliver outside boise',
    'do you deliver outside boise',
    'what areas do you deliver',
    'what city or zip code do you deliver to',
    'what cities do you deliver to',
    'what zip codes do you deliver to',
  ])

const asksCityDelivery = (text) =>
  includesAny(text, [
    'boise',
    'garden city',
    'meridian',
    'eagle',
    'star',
    'kuna',
    'nampa',
    'caldwell',
    'middleton',
    'hidden springs',
    'cascade',
    'donnelly',
    'council',
    'sun valley',
    'mccall'
  ])

function baseReply({ link, text, deliveryPrompt = true }) {
  return {
    kind: 'general',
    text,
    deliveryPrompt,
    image: null,
    link,
    products: [],
    quoteLines: [],
    selectedProduct: null,
  }
}

const callLink = () => ({
  label: `Call ${storeInfo.phone}`,
  url: storeInfo.phoneUrl,
})

const textLink = () => ({
  label: `Text ${storeInfo.textPhone}`,
  url: storeInfo.textPhoneUrl,
})

const generalDeliveryReply = () =>
  baseReply({
    link: callLink(),
    text: `Yes, we deliver. ${deliveryInfo.timingText} Have a job coming up? Send over the city or ZIP code and we can help price out dump delivery, forklift unload, and hand-unload options. Delivery timing can vary based on truck routes and material availability, so give us a call at ${storeInfo.phone} for the next available delivery window.`,
  })

const timingReply = () =>
  baseReply({
    link: callLink(),
    text: `We can probably deliver it today unless it is a large lumber pack that needs to be built, material needs to be pulled from another location, or the truck schedule is already full. Please call ${storeInfo.phone} to verify the next available delivery window.`,
  })

const pricingReply = () =>
  baseReply({
    link: callLink(),
    text: 'We can help price delivery once we know the job city or ZIP code and the unload type. Send over the location and we can estimate dump delivery, forklift unload, or hand-unload pricing.',
  })

const unloadTypeReply = () =>
  baseReply({
    link: textLink(),
    text: `We offer different delivery options depending on the order and jobsite, including dump delivery, forklift unload, and hand unload. If access is tight or you need material placed in a specific spot, call ${storeInfo.phone} or text photos to ${storeInfo.textPhone} so we can help confirm the best option.`,
  })

const accessReply = () =>
  baseReply({
    link: textLink(),
    text: `Jobsite access can make a big difference. If the driveway, alley, gravel, or unload area is tight, text us a few photos at ${storeInfo.textPhone} and we can help figure out whether dump delivery, forklift unload, or hand unload makes the most sense.`,
  })

const deliveryAreaReply = () =>
  baseReply({
    link: callLink(),
    text: 'We deliver in Boise and surrounding areas. The best way to confirm delivery to your jobsite is to send the city or ZIP code, then we can help estimate delivery options and timing.',
  })

function zipDeliveryReply(prompt) {
  const deliveryZip = findDeliveryZip(prompt)
  const deliveryZone = deliveryZip ? getDeliveryZone(deliveryZip) : null

  if (deliveryZone) {
    const freeDeliveryNote = getFreeStandardDeliveryNote(deliveryZip)

    return baseReply({
      link: callLink(),
      text: `Yes, we deliver to ${
        deliveryZone.city
      } ${deliveryZip}, ${getDeliveryPriceText(deliveryZone)} ${
        freeDeliveryNote ? `${freeDeliveryNote} ` : ''
      }We can add delivery to the quote once you pick the unload method.`,
    })
  }

  if (deliveryZip) {
    return baseReply({
      link: callLink(),
      text: `I do not have ${deliveryZip} in the delivery table yet. We can still check it at the counter, or you can call ${storeInfo.phone} and we can confirm the delivery price.`,
    })
  }

  return null
}

function cityDeliveryReply(prompt) {
  const deliveryArea = findDeliveryArea(prompt, normalizeQuery)

  if (deliveryArea) {
    const deliveryZone = getDeliveryZone(deliveryArea.zip)
    const freeDeliveryNote = getFreeStandardDeliveryNote(deliveryArea.zip)

    if (deliveryZone) {
      return baseReply({
        link: callLink(),
        text: `Good news, we deliver to ${deliveryArea.name}. That usually maps around ZIP ${deliveryArea.zip}, ${getDeliveryPriceText(
          deliveryZone,
        )} ${
          freeDeliveryNote ? `${freeDeliveryNote} ` : ''
        }Final pricing can vary by exact jobsite access and unload type.`,
      })
    }
  }

  const deliveryCity = findDeliveryCity(prompt, normalizeQuery)
  const cityEstimate = deliveryCity
    ? getDeliveryCityEstimate(deliveryCity.name)
    : null

  if (!cityEstimate) return null

  return baseReply({
    link: callLink(),
    text: `Good news, we deliver to ${deliveryCity.name}. ${getDeliveryPriceText(
      cityEstimate,
    )} Final pricing can vary based on the exact job location and delivery needs, but this should give you a good starting point.`,
  })
}

export const deliveryIntent = {
  name: 'delivery',
  strongKeywords: [
    'do you deliver',
    'deliver to',
    'delivery price',
    'delivery cost',
    'delivery fee',
    'next delivery',
    'next delivery date',
    'shipping cost',
    'shipping price',
    'shipping fee',
    'ship to',
    'soonest delivery',
    'next delivery date',
    'can you deliver today',
    'when can i get this delivered',
    'forklift unload',
    'hand unload',
    'dump delivery',
    'truck mounted forklift',
    'jobsite delivery',
  ],
  keywords: [
    'deliver',
    'delivery',
    'ship',
    'shipping',
    'drop off',
    'drop-off',
    'jobsite',
    'forklift',
    'moffett',
    'hand unload',
    'hand-unload',
    'dumped',
    'hotshot',
    'truck route',
    'delivery fee',
    'delivery cost',
    'delivery price',
  ],
  isFollowUp(prompt, lastIntent) {
    if (lastIntent !== 'delivery') return false

    const text = lower(prompt)

    return includesAny(text, [
      'today',
      'tomorrow',
      'how much',
      'what about',
      'how soon',
      'next available',
      'next delivery date',
      'forklift',
      'hand unload',
      'dump',
      'zip',
      'city',
      'boise',
      'meridian',
      'eagle',
      'nampa',
      'kuna',
      'star',
      'hidden springs',
      'north end',
      'bench',
      'harris ranch',
      'garden city',
      'chinden',
    ])
  },
  getReply(prompt) {
    const text = lower(prompt)
    const zipReply = zipDeliveryReply(prompt)
    const cityReply = cityDeliveryReply(prompt)

    if (zipReply) return zipReply
    if (cityReply) return cityReply
    if (asksDeliveryTiming(text)) return timingReply()
    if (asksDeliveryPricing(text)) return pricingReply()
    if (asksUnloadType(text)) return unloadTypeReply()
    if (asksJobsiteAccess(text)) return accessReply()
    if (asksWhereWeDeliver(text)) return deliveryAreaReply()
    if (asksCityDelivery(text)) return deliveryAreaReply()

    return generalDeliveryReply()
  },
}
