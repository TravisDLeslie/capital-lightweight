import { normalizeQuery } from '../utils/productSearch.js'
import {
  findDeliveryCity,
  findDeliveryZip,
  getDeliveryCityEstimate,
  getFreeStandardDeliveryNote,
  getDeliveryPriceText,
  getDeliveryZone,
} from '../utils/deliveryPricing.js'

const weekdayOpenMinutes = 7 * 60 + 30
const weekdayCloseMinutes = 17 * 60 + 30
const saturdayOpenMinutes = 9 * 60
const saturdayCloseMinutes = 16 * 60

const storeAddress =
  'Capital Lumber Co., 3105 W. State St. Boise, ID 83703'

const phoneNumber = '208-343-5481'
const phoneUrl = 'tel:2083435481'

const directionsUrl =
  'https://www.google.com/maps/dir/?api=1&destination=Capital%20Lumber%20Co.%2C%203105%20W.%20State%20St.%20Boise%2C%20ID%2083703'

const businessHours = {
  monday: '7:30am–5:30pm',
  tuesday: '7:30am–5:30pm',
  wednesday: '7:30am–5:30pm',
  thursday: '7:30am–5:30pm',
  friday: '7:30am–5:30pm',
  saturday: '9:00am–4:00pm',
  sunday: 'closed',
}

const dayNames = Object.keys(businessHours)

function minutesToTime(minutes) {
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  const period = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12

  return `${displayHour}:${String(minute).padStart(2, '0')}${period}`
}

function getDaySchedule(dayIndex) {
  if (dayIndex >= 1 && dayIndex <= 5) {
    return {
      label: 'weekday',
      openMinutes: weekdayOpenMinutes,
      closeMinutes: weekdayCloseMinutes,
    }
  }

  if (dayIndex === 6) {
    return {
      label: 'Saturday',
      openMinutes: saturdayOpenMinutes,
      closeMinutes: saturdayCloseMinutes,
    }
  }

  return null
}

function getNextOpenText(date) {
  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDate = new Date(date)
    nextDate.setDate(date.getDate() + offset)

    const schedule = getDaySchedule(nextDate.getDay())

    if (schedule) {
      const dayLabel =
        offset === 1
          ? 'tomorrow'
          : nextDate.toLocaleDateString('en-US', {
              weekday: 'long',
            })

      return `${dayLabel} at ${minutesToTime(schedule.openMinutes)}`
    }
  }

  return 'the next business day'
}

function titleCaseDay(day) {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

function normalizeText(text = '') {
  return normalizeQuery(text)
}

function normalizeTerms(terms = []) {
  return terms.map((term) => normalizeText(term))
}

function hasAny(normalizedPrompt, terms = []) {
  return normalizeTerms(terms).some((term) =>
    normalizedPrompt.includes(term),
  )
}

function scoreIntent(normalizedPrompt, intent) {
  let score = 0

  normalizeTerms(intent.keywords || []).forEach((keyword) => {
    if (normalizedPrompt.includes(keyword)) {
      score += 2
    }
  })

  normalizeTerms(intent.strongKeywords || []).forEach((keyword) => {
    if (normalizedPrompt.includes(keyword)) {
      score += 4
    }
  })

  normalizeTerms(intent.negativeKeywords || []).forEach((keyword) => {
    if (normalizedPrompt.includes(keyword)) {
      score -= 4
    }
  })

  return score
}

function getBestIntent(normalizedPrompt, intents) {
  const scored = intents
    .map((intent) => ({
      ...intent,
      score: scoreIntent(normalizedPrompt, intent),
    }))
    .filter((intent) => intent.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored[0] || null
}

function withIntent(reply, intentName) {
  if (!reply) return null

  return {
    ...reply,
    intent: intentName,
  }
}

function getMentionedDay(normalizedPrompt) {
  if (normalizedPrompt.includes('today')) return 'today'
  if (normalizedPrompt.includes('tomorrow')) return 'tomorrow'

  return dayNames.find((day) => normalizedPrompt.includes(day))
}

function getHoursReply(prompt, now = new Date()) {
  const normalizedPrompt = normalizeText(prompt)
  const mentionedDay = getMentionedDay(normalizedPrompt)

  if (mentionedDay && mentionedDay !== 'today' && mentionedDay !== 'tomorrow') {
    if (mentionedDay === 'sunday') {
      return {
        text: "We're closed on Sundays.",
      }
    }

    return {
      text: `On ${titleCaseDay(mentionedDay)}, we're open ${businessHours[mentionedDay]}.`,
    }
  }

  if (mentionedDay === 'tomorrow') {
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)

    const dayName = dayNames[tomorrow.getDay() === 0 ? 6 : tomorrow.getDay() - 1]
    const schedule = getDaySchedule(tomorrow.getDay())

    if (!schedule) {
      return {
        text: "We're closed tomorrow.",
      }
    }

    return {
      text: `Tomorrow is ${titleCaseDay(dayName)}. We're open ${businessHours[dayName]}.`,
    }
  }

  const schedule = getDaySchedule(now.getDay())
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const standardHours =
    'Our regular hours are Monday-Friday 7:30am-5:30pm and Saturday 9:00am-4:00pm. We are closed Sundays.'

  if (schedule && currentMinutes < schedule.openMinutes) {
    return {
      text: `We are closed right now, but we open today at ${minutesToTime(
        schedule.openMinutes,
      )}. ${standardHours}`,
    }
  }

  if (schedule && currentMinutes < schedule.closeMinutes) {
    return {
      text: `We are open today until ${minutesToTime(
        schedule.closeMinutes,
      )}. ${standardHours}`,
    }
  }

  return {
    text: `We are closed right now, but we will be open ${getNextOpenText(
      now,
    )}. ${standardHours}`,
  }
}

function getOrderingReply() {
  return {
    text:
      'We do not currently offer online ordering. You can email your quote to travis@capitallumber.co, call us and order over the phone at 208-343-5481, or visit us in person at Capital Lumber Co., 3105 W. State St, Boise, ID 83703 near 31st and State. We accept cash, check, credit cards, and Venmo.',
    link: {
      label: 'Call 208-343-5481',
      url: phoneUrl,
    },
  }
}

function getInPersonPurchaseReply() {
  return {
    text:
      'You do not have to visit in person to place an order. You can call us at 208-343-5481 and order over the phone, or email your quote to travis@capitallumber.co. You are also welcome to stop by Capital Lumber Co. at 3105 W. State St, Boise, ID 83703 near 31st and State. We accept cash, check, credit cards, and Venmo.',
    link: {
      label: 'Call 208-343-5481',
      url: phoneUrl,
    },
  }
}

function getDeliveryReply(prompt) {
  const deliveryZip = findDeliveryZip(prompt)
  const deliveryZone = deliveryZip ? getDeliveryZone(deliveryZip) : null

  if (deliveryZone) {
    const freeDeliveryNote = getFreeStandardDeliveryNote(deliveryZip)

    return {
      text: `Yes, we deliver to ${
        deliveryZone.city
      } ${deliveryZip}, ${getDeliveryPriceText(deliveryZone)} ${
        freeDeliveryNote ? `${freeDeliveryNote} ` : ''
      }We can add delivery to the quote once you pick the unload method.`,
    }
  }

  const deliveryCity = findDeliveryCity(prompt, normalizeQuery)
  const cityEstimate = deliveryCity
    ? getDeliveryCityEstimate(deliveryCity.name)
    : null

  if (cityEstimate) {
    return {
      text: `Yes, we deliver to ${deliveryCity.name}, ${getDeliveryPriceText(
        cityEstimate,
      )} Exact price can depend on the job ZIP, but that gives you the starting point before any item is selected.`,
    }
  }

  if (deliveryZip) {
    return {
      text: `I do not have ${deliveryZip} in the delivery table yet. We can still check it at the counter, or you can call 208-343-5481 and we can confirm the delivery price.`,
    }
  }

  return {
    text:
      'Yes, we deliver. Send the job ZIP or city and I can give you dumped, forklift unload, and hand-unload pricing before you even pick an item.',
    deliveryPrompt: true,
  }
}

function getAboutReply() {
  return {
    text:
      'Capital Lumber has been building Boise since 1905. What started as a small yard on Main Street has grown into one of Idaho’s trusted names in lumber and building materials. Today, the Perrin family is carrying the yard into its next chapter with the same old-school values: hard work, integrity, community, and genuine connection.',
    image: {
      alt: 'Historic Capital Lumber storefront',
      src: '/capital-history.avif',
    },
    link: {
      label: 'Read our story',
      url: 'https://www.capitallumber.co/our-story',
    },
  }
}

function getEstimatingReply() {
  return {
    text:
      'Yes, we can help with estimating and pricing based off drawings, sketches, measurements, or plans. Send us what you have, even if it is just a rough sketch with dimensions, and we can help turn it into a material list or quote. For plans and larger takeoffs, please email dane@capitallumber.co. For simpler measurements or quick pricing, you can call us at 208-343-5481 or stop by the yard.',
    link: {
      label: 'Email drawings to Dane',
      url: 'mailto:dane@capitallumber.co?subject=Estimate%20from%20Drawings%20or%20Measurements',
    },
  }
}

function getTakeoffReply() {
  return {
    text:
      'Yes, we do material lists and takeoffs from plans. Please send a PDF of the plans/prints, including structurals if you have them, to dane@capitallumber.co.',
    link: {
      label: 'Email plans to Dane',
      url: 'mailto:dane@capitallumber.co?subject=Plans%20for%20Material%20List',
    },
  }
}

function getPaymentReply() {
  return {
    text:
      'We take cash, Venmo, credit card in person, credit card over the phone, and check. Please note that with a check, we will not ship or release delivery until the check fully clears. You can always give us a call at 208-343-5481.',
    link: {
      label: 'Call 208-343-5481',
      url: phoneUrl,
    },
  }
}

function getContractorReply() {
  return {
    text:
      'Yes, we offer contractor services. Approved contractors can get special pricing, Net 30 day terms, and the things contractors are usually looking for. To get a contractor account set up, please give us a call at 208-343-5481 or email accounting@capitallumber.co.',
    link: {
      label: 'Email accounting',
      url: 'mailto:accounting@capitallumber.co?subject=Contractor%20Account%20Setup',
    },
  }
}

function getDirectionsReply() {
  return {
    text: `We are located at ${storeAddress}. Tap below for directions.`,
    link: {
      label: 'Get directions',
      url: directionsUrl,
    },
  }
}

function getFallbackReply() {
  return {
    text:
      'I’m not fully sure on that one yet. Give us a call at 208-343-5481 and we’ll help you out.',
    link: {
      label: 'Call 208-343-5481',
      url: phoneUrl,
    },
    fallback: true,
  }
}

const intents = [
  {
    name: 'inPersonPurchase',
    strongKeywords: [
      'do i have to come in',
      'do i need to come in',
      'do i need to visit',
      'do i have to visit',
      'can i buy without coming in',
      'can i order without coming in',
      'purchase in person',
      'buy in person',
      'order in person',
      'come in to order',
      'visit in person',
    ],
    keywords: [
      'in person',
      'come in',
      'visit',
      'stop by',
      'order',
      'buy',
      'purchase',
    ],
    handler: () => getInPersonPurchaseReply(),
  },
  {
    name: 'onlineOrdering',
    strongKeywords: [
      'online ordering',
      'order online',
      'buy online',
      'purchase online',
      'place order online',
      'website order',
      'online order',
      'cart checkout',
      'checkout online',
      'phone order',
      'order over phone',
      'call in order',
      'call and order',
    ],
    keywords: [
      'online',
      'order',
      'ordering',
      'buy',
      'purchase',
      'phone order',
      'call order',
    ],
    handler: () => getOrderingReply(),
  },
  {
    name: 'hours',
    strongKeywords: [
      'hours',
      'what time do you open',
      'what time do you close',
      'are you open',
      'are you closed',
      'open sunday',
      'open saturday',
      'closed sunday',
      'what about sunday',
      'what about saturday',
    ],
    keywords: [
      'open',
      'close',
      'closed',
      'closing',
      'hours',
      'late',
      'today',
      'tomorrow',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ],
    handler: (prompt, now) => getHoursReply(prompt, now),
  },
  {
    name: 'delivery',
    strongKeywords: [
      'do you deliver',
      'delivery price',
      'delivery cost',
      'deliver to',
      'forklift unload',
      'hand unload',
      'dump delivery',
    ],
    keywords: [
      'delivery',
      'deliver',
      'delivered',
      'dump',
      'dumped',
      'forklift',
      'unload',
      'hand unload',
      'jobsite',
      'ship',
    ],
    handler: (prompt) => getDeliveryReply(prompt),
  },
  {
  name: 'estimating',
  strongKeywords: [
    'can you estimate',
    'do you estimate',
    'can you quote from a drawing',
    'can you quote from drawings',
    'can you price from a drawing',
    'can you price from measurements',
    'estimate from sketch',
    'estimate from drawing',
    'pricing from sketch',
    'pricing from drawing',
    'quote from sketch',
    'quote from measurements',
    'drawings or measurements',
    'rough sketch',
  ],
  keywords: [
    'estimate',
    'estimating',
    'drawing',
    'drawings',
    'sketch',
    'measurements',
    'dimensions',
    'quote',
    'pricing',
    'material list',
    'materials list',
  ],
  handler: () => getEstimatingReply(),
},
  {
    name: 'takeoff',
    strongKeywords: [
      'material list',
      'material lists',
      'takeoff',
      'takeoffs',
      'quote from plans',
      'quote plans',
      'plans quote',
      'blueprints',
      'pdf plans',
    ],
    keywords: [
      'plans',
      'prints',
      'blueprints',
      'takeoff',
      'takeoffs',
      'material list',
      'lumber list',
      'quote',
      'pdf',
    ],
    handler: () => getTakeoffReply(),
  },
  {
    name: 'payment',
    strongKeywords: [
      'how can i pay',
      'payment methods',
      'do you take venmo',
      'pay over the phone',
      'credit card over phone',
      'pay by phone',
      'do you take checks',
    ],
    keywords: [
      'payment',
      'pay',
      'paid',
      'cash',
      'venmo',
      'credit card',
      'card',
      'check',
      'cheque',
      'invoice',
      'billing',
    ],
    handler: () => getPaymentReply(),
  },
  {
    name: 'contractor',
    strongKeywords: [
      'contractor account',
      'builder account',
      'pro account',
      'contractor pricing',
      'builder pricing',
      'charge account',
      'credit account',
      'net 30',
      'terms account',
    ],
    keywords: [
      'contractor',
      'contractors',
      'builder',
      'builders',
      'account',
      'special pricing',
      'pro pricing',
      'net30',
      'terms',
      'credit',
      'charge',
    ],
    handler: () => getContractorReply(),
  },
  {
    name: 'directions',
    strongKeywords: [
      'where are you located',
      'what is your address',
      'get directions',
      'directions to',
      'where are you',
      'where you at',
    ],
    keywords: [
      'directions',
      'direction',
      'located',
      'location',
      'address',
      'where',
      'map',
    ],
    handler: () => getDirectionsReply(),
  },
  {
    name: 'about',
    strongKeywords: [
      'about us',
      'our story',
      'company history',
      'when were you founded',
      'how long have you been around',
      'capital history',
    ],
    keywords: [
      'about',
      'story',
      'history',
      'founded',
      'founding',
      'started',
      '1905',
    ],
    handler: () => getAboutReply(),
  },
]

function getFollowUpReply(prompt, now, context = {}) {
  const normalizedPrompt = normalizeText(prompt)
  const lastIntent = context.lastIntent || context.intent || null

  if (!lastIntent) return null

  if (
    lastIntent === 'hours' &&
    hasAny(normalizedPrompt, [
      'sunday',
      'saturday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'tomorrow',
      'today',
      'what about',
      'and sunday',
      'and saturday',
    ])
  ) {
    return withIntent(getHoursReply(prompt, now), 'hours')
  }

  if (
    lastIntent === 'delivery' &&
    hasAny(normalizedPrompt, [
      'forklift',
      'hand unload',
      'dump',
      'dumped',
      'zip',
      'city',
      'how much',
      'price',
      'cost',
    ])
  ) {
    return withIntent(getDeliveryReply(prompt), 'delivery')
  }

  if (
    lastIntent === 'onlineOrdering' &&
    hasAny(normalizedPrompt, [
      'phone',
      'call',
      'email',
      'in person',
      'come in',
      'visit',
      'pay',
      'payment',
    ])
  ) {
    return withIntent(getOrderingReply(), 'onlineOrdering')
  }

  return null
}

export function getGeneralQuestionReply(
  prompt,
  now = new Date(),
  context = {},
) {
  const normalizedPrompt = normalizeText(prompt)

  const followUpReply = getFollowUpReply(prompt, now, context)

  if (followUpReply) {
    return followUpReply
  }

  const bestIntent = getBestIntent(normalizedPrompt, intents)

  if (!bestIntent) {
    return null
  }

  return withIntent(
    bestIntent.handler(prompt, now, context),
    bestIntent.name,
  )
}

export function getGeneralQuestionFallbackReply() {
  return getFallbackReply()
}