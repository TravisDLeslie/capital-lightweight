import { products as fallbackProducts } from '../data/products'

const productEndpoint = '/api/products'

function hasUsableProducts(products) {
  return Array.isArray(products) && products.length > 0
}

export async function fetchProducts() {
  try {
    const response = await fetch(productEndpoint)

    if (!response.ok) {
      throw new Error(`Product API returned ${response.status}`)
    }

    const data = await response.json()

    if (hasUsableProducts(data.products)) {
      return {
        products: data.products,
        source: data.cached ? 'airtable-cache' : 'airtable',
      }
    }
  } catch (error) {
    console.warn('Using fallback product catalog:', error)
  }

  return {
    products: fallbackProducts,
    source: 'fallback',
  }
}

export { fallbackProducts }
