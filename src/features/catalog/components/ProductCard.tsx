import { useState } from 'react'
import type { Product } from '../model/types'

const priceFormatter = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  useGrouping: false,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function ProductCard({ product }: { product: Product }) {
  const [photoUnavailable, setPhotoUnavailable] = useState(false)

  return (
    <article className="product-card">
      <div className="product-card__photo">
        {photoUnavailable ? (
          <span>Фото недоступне</span>
        ) : (
          <img src={product.thumbnail} alt={product.title} onError={() => setPhotoUnavailable(true)} />
        )}
      </div>
      <h2>{product.title}</h2>
      <p className="product-card__price">{priceFormatter.format(product.price)}</p>
    </article>
  )
}
