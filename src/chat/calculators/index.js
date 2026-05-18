import {
  isDeckingCalculatorStart,
  startDeckingCalculator,
} from './deckingCalculator.js'
import { isFenceCalculatorStart, startFenceCalculator } from './fenceCalculator.js'

export function getCalculatorReply(prompt) {
  if (isFenceCalculatorStart(prompt)) {
    return startFenceCalculator(prompt)?.reply || null
  }

  if (isDeckingCalculatorStart(prompt)) {
    return startDeckingCalculator(prompt)?.reply || null
  }

  return null
}
