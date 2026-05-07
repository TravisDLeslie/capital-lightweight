import { normalizeQuery } from '../utils/productSearch.js'

const numberWords = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
}

const quantityPattern =
  /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s*(sheets?|pcs?|pieces?|boards?|studs?|ea|each|feet|foot|ft)\b/i

const quantityBeforeProductPattern =
  /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s+(?=\d+\s*x\s*\d+|\d+x\d+|\d+\s*x\s*\d+\s*[-x]|\d+x\d+[-x])/i

const calculationChunkPattern =
  /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s*(?:(sheets?|pcs?|pieces?|boards?|studs?|ea|each|feet|foot|ft)\s*(?:of\s+)?)?(.+?)(?=\s+(?:and|&)\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b|$)/gi

function getNumberValue(value) {
  return numberWords[value.toLowerCase()] || Number(value)
}

function parseQuantity(prompt) {
  const match = prompt.match(quantityPattern)

  if (match) {
    return {
      quantity: getNumberValue(match[1]),
      requestedUnit: match[2].toLowerCase(),
    }
  }

  const quantityBeforeProductMatch = prompt.match(quantityBeforeProductPattern)

  if (quantityBeforeProductMatch) {
    return {
      quantity: getNumberValue(quantityBeforeProductMatch[1]),
      requestedUnit: 'each',
    }
  }

  return null
}

function inferRequestedUnit(description, explicitUnit) {
  if (explicitUnit) {
    return explicitUnit.toLowerCase()
  }

  if (/\b(osb|sheet|sheets|panel|sheathing|subfloor|zip|advantech)\b/i.test(description)) {
    return 'sheet'
  }

  if (/\b(tji|lvl|microllam|microlam|ft|feet|foot)\b/i.test(description)) {
    return 'linear ft'
  }

  return 'each'
}

function parseCalculationRequests(prompt) {
  const requests = [...prompt.matchAll(calculationChunkPattern)]
    .map((match) => {
      const description = match[3]
        .replace(/[?!.]/g, '')
        .replace(/'s\b/g, '')
        .trim()

      return {
        description,
        quantity: getNumberValue(match[1]),
        requestedUnit: inferRequestedUnit(description, match[2]),
      }
    })
    .filter((request) => request.description)

  if (requests.length) {
    return requests
  }

  const parsedQuantity = parseQuantity(prompt)

  if (!parsedQuantity) {
    return []
  }

  return [
    {
      description: prompt,
      quantity: parsedQuantity.quantity,
      requestedUnit: parsedQuantity.requestedUnit,
    },
  ]
}

function hasPricingIntent(prompt) {
  return (
    /\b(price|pricing|cost|total|quote|estimate|how much|howmuch)\b/i.test(prompt) ||
    (/\bwhat(?:'s| is)?\b/i.test(prompt) && parseCalculationRequests(prompt).length > 0)
  )
}

function getUnitScore(requestedUnit, productUnit) {
  if (/sheets?/.test(requestedUnit) && productUnit === 'sheet') {
    return 5
  }

  if (/(pcs?|pieces?|boards?|studs?|ea|each)/.test(requestedUnit) && productUnit === 'each') {
    return 4
  }

  if (/(feet|foot|ft)/.test(requestedUnit) && productUnit === 'linear ft') {
    return 5
  }

  return 0
}

function scoreProductForPrompt(prompt, product, requestedUnit) {
  const normalizedPrompt = normalizeQuery(prompt)
  const requestedFraction = ['7/16', '19/32', '5/8', '3/4', '7/8', '1-1/8'].find(
    (fraction) => prompt.includes(fraction),
  )

  if (requestedFraction && !product.dimensions.includes(requestedFraction)) {
    return 0
  }

  const productValues = [product.name, product.dimensions, ...product.aliases]
  const aliasScore = productValues.some((value) =>
    normalizedPrompt.includes(normalizeQuery(value)),
  )
    ? 10
    : 0

  const fractionScore = requestedFraction ? 8 : 0

  const categoryScore =
    /\b(osb|sheet|panel|sheathing|subfloor)\b/i.test(prompt) &&
    product.category === 'Sheet Goods'
      ? 3
      : 0

  return aliasScore + fractionScore + categoryScore + getUnitScore(requestedUnit, product.unit)
}

function findCalculationProduct(prompt, products, matchedProducts, requestedUnit) {
  const candidates = (matchedProducts.length ? matchedProducts : products).filter(
    (product) => product.price,
  )

  return candidates
    .map((product) => ({
      product,
      score: scoreProductForPrompt(prompt, product, requestedUnit),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((first, second) => second.score - first.score)[0]?.product
}

export function getPriceCalculation(prompt, products, matchedProducts) {
  if (!hasPricingIntent(prompt)) {
    return null
  }

  const calculationRequests = parseCalculationRequests(prompt)

  if (!calculationRequests.length) {
    return null
  }

  const lines = calculationRequests
    .map((request) => {
      const candidateProducts = calculationRequests.length > 1 ? [] : matchedProducts
      const product = findCalculationProduct(
        request.description,
        products,
        candidateProducts,
        request.requestedUnit,
      )

      if (!product) {
        return null
      }

      return {
        product,
        quantity: request.quantity,
        total: request.quantity * product.price,
      }
    })
    .filter(Boolean)

  if (!lines.length) {
    return null
  }

  const total = lines.reduce((sum, line) => sum + line.total, 0)
  const [firstLine] = lines
  const lineText = lines
    .map((line) => {
      const unitLabel =
        line.product.unit === 'sheet'
          ? 'sheets'
          : line.product.unit === 'linear ft'
            ? 'linear ft'
            : 'pieces'

      return `${line.quantity} ${unitLabel} of ${line.product.name} at $${line.product.price.toFixed(2)} / ${line.product.unit} = $${line.total.toFixed(2)}`
    })
    .join('; ')

  return {
    product: firstLine.product,
    products: lines.map((line) => line.product),
    quantity: firstLine.quantity,
    lines,
    total,
    text:
      lines.length > 1
        ? `${lineText}. Combined total is $${total.toFixed(2)} before tax or delivery.`
        : `${lineText.replace(' = ', ' comes to ')} before tax or delivery.`,
  }
}
