import { normalizeQuery } from '../utils/productSearch.js'

const weekdayOpenMinutes = 7 * 60 + 30
const weekdayCloseMinutes = 17 * 60
const saturdayOpenMinutes = 9 * 60
const saturdayCloseMinutes = 16 * 60
const storeAddress = 'Capital Lumber Co., 3105 W. State St. Boise, ID 83703'
const directionsUrl =
  'https://www.google.com/maps/dir/?api=1&destination=Capital%20Lumber%20Co.%2C%203105%20W.%20State%20St.%20Boise%2C%20ID%2083703'

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
          : nextDate.toLocaleDateString('en-US', { weekday: 'long' })

      return `${dayLabel} at ${minutesToTime(schedule.openMinutes)}`
    }
  }

  return 'the next business day'
}

export function getGeneralQuestionReply(prompt, now = new Date()) {
  const normalizedPrompt = normalizeQuery(prompt)
  const isAboutQuestion = [
    'aboutus',
    'ourstory',
    'history',
    'founded',
    'founding',
    'howlong',
    'howlonghaveyou',
    'around',
    'started',
    'startedin',
    'whatyear',
    'capitalhistory',
  ].some((term) => normalizedPrompt.includes(term))

  if (isAboutQuestion) {
    return {
      text: 'Capital Lumber has been building Boise since 1905. What started as a small yard on Main Street has grown into one of Idaho’s trusted names in lumber and building materials. Today, the Perrin family is carrying the yard into its next chapter with the same old-school values: hard work, integrity, community, and genuine connection.',
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

  const isTakeoffQuestion =
    [
      'materiallist',
      'materiallists',
      'materialslist',
      'takeoff',
      'takeoffs',
      'takelist',
      'makelist',
      'plans',
      'prints',
      'blueprints',
      'pdfplans',
      'planquote',
      'quoteplans',
      'quotefromplans',
      'lumberlist',
    ].some((term) => normalizedPrompt.includes(term)) &&
    (normalizedPrompt.includes('quote') ||
      normalizedPrompt.includes('list') ||
      normalizedPrompt.includes('takeoff') ||
      normalizedPrompt.includes('plans') ||
      normalizedPrompt.includes('prints') ||
      normalizedPrompt.includes('pdf'))

  if (isTakeoffQuestion) {
    return {
      text: 'Yes, we do material lists and takeoffs from plans. Please send a PDF of the plans/prints, including structurals if you have them, to dane@capitallumber.co.',
      link: {
        label: 'Email plans to Dane',
        url: 'mailto:dane@capitallumber.co?subject=Plans%20for%20Material%20List',
      },
    }
  }

  const isPaymentQuestion = [
    'payment',
    'pay',
    'paid',
    'cash',
    'venmo',
    'creditcard',
    'card',
    'phonepayment',
    'payoverphone',
    'paybyphone',
    'check',
    'cheque',
    'invoice',
    'billing',
  ].some((term) => normalizedPrompt.includes(term))

  if (isPaymentQuestion) {
    return {
      text: 'We take cash, Venmo, credit card in person, credit card over the phone, and check. Please note that with a check, we will not ship or release delivery until the check fully clears. You can always give us a call at 208-343-5481.',
      link: {
        label: 'Call 208-343-5481',
        url: 'tel:2083435481',
      },
    }
  }

  const isContractorQuestion = [
    'contractor',
    'contractors',
    'builder',
    'builders',
    'proaccount',
    'contractoraccount',
    'accountsetup',
    'specialpricing',
    'contractorpricing',
    'propricing',
    'net30',
    'terms',
    'creditaccount',
    'chargeaccount',
  ].some((term) => normalizedPrompt.includes(term))

  if (isContractorQuestion) {
    return {
      text: 'Yes, we offer contractor services. Approved contractors can get special pricing, Net 30 day terms, and the things contractors are usually looking for. To get a contractor account set up, please give us a call at 208-343-5481 or email accounting@capitallumber.co.',
      link: {
        label: 'Email accounting',
        url: 'mailto:accounting@capitallumber.co?subject=Contractor%20Account%20Setup',
      },
    }
  }

  const isDirectionsQuestion = [
    'directions',
    'direction',
    'getthere',
    'located',
    'location',
    'address',
    'whereareyou',
    'whereyouat',
  ].some((term) => normalizedPrompt.includes(term))

  if (isDirectionsQuestion) {
    return {
      text: `We are located at ${storeAddress}. Tap below for directions.`,
      link: {
        label: 'Get directions',
        url: directionsUrl,
      },
    }
  }

  const isHoursQuestion = [
    'open',
    'hours',
    'closetime',
    'closed',
    'howlate',
    'whattime',
  ].some((term) => normalizedPrompt.includes(term))

  if (!isHoursQuestion) {
    return null
  }

  const schedule = getDaySchedule(now.getDay())
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const standardHours = 'Our regular hours are Monday-Friday 7:30am-5:00pm and Saturday 9:00am-4:00pm.'

  if (schedule && currentMinutes < schedule.openMinutes) {
    return {
      text: `We are closed right now, but we open today at ${minutesToTime(schedule.openMinutes)}. ${standardHours}`,
    }
  }

  if (schedule && currentMinutes < schedule.closeMinutes) {
    return {
      text: `We are open today until ${minutesToTime(schedule.closeMinutes)}. ${standardHours}`,
    }
  }

  return {
    text: `We are closed right now, but we will be open ${getNextOpenText(now)}. ${standardHours}`,
  }
}
