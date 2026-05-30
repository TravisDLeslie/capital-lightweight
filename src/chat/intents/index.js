import { accountIntent } from './accountIntent.js'
import { accountingIntent } from './accountingIntent.js'
import { cdxIntent } from './cdxIntent.js'
import { comparisonIntent } from './comparisonIntent.js'
import { contactIntent } from './contactIntent.js'
import { contractorIntent } from './contractorIntent.js'
import { deliveryIntent } from './deliveryIntent.js'
import { doorWindowIntent } from './doorWindowIntent.js'
import { estimatingIntent } from './estimatingIntent.js'
import { greetingIntent } from './greetingIntent.js'
import { hoursIntent } from './hoursIntent.js'
import { inventoryIntent } from './inventoryIntent.js'
import { locationIntent } from './locationIntent.js'
import { orderingIntent } from './orderingIntent.js'
import { paymentsIntent } from './paymentsIntent.js'
import { productRecommendationIntent } from './productRecommendationIntent.js'
import { returnsIntent } from './returnsIntent.js'
import { servicesIntent } from './servicesIntent.js'
import { suppliesIntent } from './suppliesIntent.js'
import { thankYouIntent } from './thankYouIntent.js'
import { textSupportIntent } from './textSupportIntent.js'
import { urgentIntent } from './urgentIntent.js'
import { woodPricingIntent } from './woodPricingIntent.js'
import { scoreKeywords } from '../utils/matchKeywords.js'

const intents = [
  urgentIntent,
  deliveryIntent,
  hoursIntent,
  contactIntent,
  accountingIntent,
  doorWindowIntent,
  cdxIntent,
  orderingIntent,
  estimatingIntent,
  textSupportIntent,
  suppliesIntent,
  inventoryIntent,
  productRecommendationIntent,
  woodPricingIntent,
  comparisonIntent,
  paymentsIntent,
  locationIntent,
  contractorIntent,
  accountIntent,
  returnsIntent,
  servicesIntent,
  greetingIntent,
  thankYouIntent,
]

export function getIntentReply(prompt, context = {}) {
  const rankedIntents = intents
    .filter((intent) => !intent.shouldSkip?.(prompt, context))
    .map((intent) => {
      const followUpScore = intent.isFollowUp?.(prompt, context.lastIntent)
        ? 6
        : 0

      return {
        intent,
        score: scoreKeywords(prompt, intent) + followUpScore,
      }
    })
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score)

  return rankedIntents[0]?.intent.getReply(prompt, context) || null
}
