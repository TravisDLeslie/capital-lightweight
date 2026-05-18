import { storeInfo } from '../data/storeInfo.js'
import { hasAnyKeyword } from '../utils/matchKeywords.js'
import { normalizeQuery } from '../products/productSearch.js'

const dayNames = Object.keys(storeInfo.hours)
const weekdayOpenMinutes = 7 * 60 + 30
const weekdayCloseMinutes = 17 * 60 + 30
const saturdayOpenMinutes = 9 * 60
const saturdayCloseMinutes = 16 * 60

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

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
      closeMinutes: weekdayCloseMinutes,
      openMinutes: weekdayOpenMinutes,
    }
  }

  if (dayIndex === 6) {
    return {
      closeMinutes: saturdayCloseMinutes,
      openMinutes: saturdayOpenMinutes,
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

function getMentionedDay(prompt) {
  const normalizedPrompt = normalizeQuery(prompt)
  if (normalizedPrompt.includes('today')) return 'today'
  if (normalizedPrompt.includes('tomorrow')) return 'tomorrow'

  return dayNames.find((day) => normalizedPrompt.includes(day))
}

function getDayName(date) {
  return dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1]
}

export const hoursIntent = {
  name: 'hours',
  strongKeywords: [
    'hours',
    'what time do you open',
    'what time do you close',
    'are you open',
    'are you closed',
    'what about sunday',
    'open sunday',
    'closed sunday',
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
    ...dayNames,
  ],
  getReply(prompt, context = {}) {
    const now = context.now || new Date()
    const mentionedDay = getMentionedDay(prompt)
    const standardHours =
      'Our regular hours are Monday-Friday 7:30am-5:30pm and Saturday 9:00am-4:00pm. We are closed Sundays.'

    if (mentionedDay && mentionedDay !== 'today' && mentionedDay !== 'tomorrow') {
      const hours = storeInfo.hours[mentionedDay]

      if (mentionedDay === 'sunday') {
        return {
          kind: 'general',
          text: "We're closed on Sundays. Regular hours are Monday-Friday 7:30am-5:30pm and Saturday 9:00am-4:00pm.",
        }
      }

      return {
        kind: 'general',
        text: `On ${titleCase(mentionedDay)}, we're open ${hours}.`,
      }
    }

    if (mentionedDay === 'tomorrow') {
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      const dayName = getDayName(tomorrow)
      const schedule = getDaySchedule(tomorrow.getDay())

      if (!schedule) {
        return {
          kind: 'general',
          text: `We're closed tomorrow. ${standardHours}`,
        }
      }

      return {
        kind: 'general',
        text: `Tomorrow is ${titleCase(dayName)}. We're open ${storeInfo.hours[dayName]}.`,
      }
    }

    const schedule = getDaySchedule(now.getDay())
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    if (schedule && currentMinutes < schedule.openMinutes) {
      return {
        kind: 'general',
        text: `We are closed right now, but we open today at ${minutesToTime(
          schedule.openMinutes,
        )}. ${standardHours}`,
      }
    }

    if (schedule && currentMinutes < schedule.closeMinutes) {
      return {
        kind: 'general',
        text: `We are open today until ${minutesToTime(
          schedule.closeMinutes,
        )}. ${standardHours}`,
      }
    }

    return {
      kind: 'general',
      text: `We are closed right now, but we will be open ${getNextOpenText(
        now,
      )}. ${standardHours}`,
    }
  },
  isFollowUp(prompt, lastIntent) {
    return (
      lastIntent === 'hours' &&
      hasAnyKeyword(prompt, [
        'what about',
        'sunday',
        'saturday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'today',
        'tomorrow',
      ])
    )
  },
}
