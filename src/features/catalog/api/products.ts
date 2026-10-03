import type { Product } from '../model/types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPhotoUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('https://dummyjson.com/products?limit=20&skip=0')
  if (!response.ok) throw new Error('Products request failed')
  const data: unknown = await response.json()
  if (!isRecord(data) || !Array.isArray(data.products) || data.products.length > 20) {
    throw new Error('Invalid products response')
  }

  const ids = new Set<number>()
  return data.products.map((item: unknown) => {
    if (!isRecord(item) ||
      typeof item.id !== 'number' || !Number.isInteger(item.id) || item.id <= 0 || ids.has(item.id) ||
      typeof item.title !== 'string' || !item.title.trim() ||
      typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0 ||
      !isPhotoUrl(item.thumbnail)) {
      throw new Error('Invalid product')
    }
    ids.add(item.id)
    return { id: item.id, title: item.title, price: item.price, thumbnail: item.thumbnail }
  })
}
