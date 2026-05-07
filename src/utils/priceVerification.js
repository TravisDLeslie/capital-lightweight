const priceVerificationLabels = [
  'Price verified 1 day ago',
  'Price verified 2 days ago',
  'Price verified 4 days ago',
  'Price verified 1 week ago',
]

function getStableIndex(value) {
  return [...value].reduce((total, character) => {
    return total + character.charCodeAt(0)
  }, 0)
}

export function getPriceVerificationLabel(product) {
  const explicitLabel = product.priceVerifiedLabel

  if (explicitLabel) {
    return explicitLabel
  }

  return priceVerificationLabels[
    getStableIndex(product.id) % priceVerificationLabels.length
  ]
}
