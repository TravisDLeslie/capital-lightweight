export function getInternalSku(product) {
  if (product.stockSku) {
    return product.stockSku
  }

  const id = String(product.id || '')

  if (product.modelNumber || !id) {
    return null
  }

  if (/^[a-z]{0,3}\d+$/i.test(id)) {
    return id.toUpperCase()
  }

  return null
}

export function getProductCodes(product) {
  return [
    getInternalSku(product)
      ? { label: 'Internal SKU', value: getInternalSku(product) }
      : null,
    product.modelNumber
      ? { label: 'Model #', value: product.modelNumber }
      : null,
    product.upc ? { label: 'UPC', value: product.upc } : null,
  ].filter(Boolean)
}
