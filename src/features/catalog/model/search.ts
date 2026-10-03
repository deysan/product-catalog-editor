import type { Product } from './types'

export function filterProductsByTitle(products: readonly Product[], query: string): readonly Product[] {
  const normalizedQuery = query.trim().toLowerCase()
  return products.filter((product) => product.title.toLowerCase().includes(normalizedQuery))
}
