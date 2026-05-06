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
