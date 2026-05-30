const availabilityStyles = {
  'in-stock': {
    badgeClass: 'bg-emerald-50 text-emerald-700',
    dotClass: 'bg-emerald-600',
    pingClass: 'bg-emerald-500',
    chipClass: 'bg-emerald-100 text-emerald-800',
    detailTitle: 'Ready for pickup',
    detailText: 'Delivery available',
    listText(product) {
      if (product.stockLabel) {
        return product.stockLabel
      }

      return `${product.stock} pcs available`
    },
    priceFallback: 'Ask',
  },
  'lead-time': {
    badgeClass: 'bg-sky-50 text-sky-700',
    dotClass: 'bg-sky-600',
    pingClass: 'bg-sky-500',
    chipClass: 'bg-sky-100 text-sky-800',
    detailTitle: 'Available by order',
    detailText(product) {
      return product.availability?.label || product.leadTime
    },
    listText(product) {
      return product.availability?.label || product.leadTime
    },
    priceFallback: 'Ask',
  },
  'custom-order': {
    badgeClass: 'bg-amber-50 text-amber-800',
    dotClass: 'bg-amber-600',
    pingClass: 'bg-amber-500',
    chipClass: 'bg-amber-100 text-amber-900',
    detailTitle: 'Custom order',
    detailText(product) {
      return product.availability?.label
    },
    listText(product) {
      return product.availability?.label
    },
    priceFallback: 'Call',
  },
}

export function getAvailability(product) {
  const type =
    product.availability?.type || (product.leadTime ? 'lead-time' : 'in-stock')
  const style = availabilityStyles[type] || availabilityStyles['in-stock']
  const label =
    product.availability?.label ||
    product.stockLabel ||
    product.leadTime ||
    (type === 'in-stock' ? 'In stock' : 'Available by order')

  return {
    type,
    label,
    badgeClass: style.badgeClass,
    dotClass: style.dotClass,
    pingClass: style.pingClass,
    chipClass: style.chipClass,
    detailTitle: style.detailTitle,
    detailText:
      typeof style.detailText === 'function'
        ? style.detailText(product)
        : style.detailText,
    listText:
      typeof style.listText === 'function' ? style.listText(product) : label,
    priceFallback: style.priceFallback,
  }
}
