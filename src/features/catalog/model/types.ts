export type Product = {
  id: number
  title: string
  price: number
  thumbnail: string
}

export type CatalogStatus = 'idle' | 'loading' | 'success' | 'error'
