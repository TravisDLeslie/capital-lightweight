export const salesTaxRate = 0.06

export function getQuoteSubtotal(items) {
  return items.reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)
}

export function getQuoteTax(subtotal) {
  return subtotal * salesTaxRate
}

export function getQuoteTotal(subtotal) {
  return subtotal + getQuoteTax(subtotal)
}

export function getSalesTaxLabel() {
  return `${(salesTaxRate * 100).toFixed(0)}% Idaho sales tax`
}
