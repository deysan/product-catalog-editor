import { create } from 'zustand'
import { fetchProducts } from '../api/products'
import type { CatalogStatus, Product } from './types'
type CatalogState = {
  products: Product[]
  initialProducts: readonly Readonly<Product>[]
  status: CatalogStatus
  error: string | null
  loadProducts: () => Promise<void>
}
export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: [], initialProducts: [], status: 'idle', error: null,
  loadProducts: async () => {
    const { status } = get()
    if (status !== 'idle' && status !== 'error') return
    set({ status: 'loading', error: null, products: [], initialProducts: [] })
    try {
      const products = await fetchProducts()
      set({
        products: products.map((product) => ({ ...product })),
        initialProducts: products.map((product) => ({ ...product })),
        status: 'success',
        error: null,
      })
    } catch {
      set({
        products: [], initialProducts: [], status: 'error',
        error: 'Не вдалося завантажити товари. Спробуйте ще раз.',
      })
    }
  },
}))
