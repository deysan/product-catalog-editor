import { useEffect, useId, useRef, useState } from 'react'
import { useCatalogStore } from '../model/catalogStore'
import { filterProductsByTitle } from '../model/search'
import { ProductCard } from './ProductCard'
import '../../../styles/catalog.css'

export function Catalog() {
  const products = useCatalogStore((state) => state.products)
  const status = useCatalogStore((state) => state.status)
  const error = useCatalogStore((state) => state.error)
  const loadProducts = useCatalogStore((state) => state.loadProducts)
  const [query, setQuery] = useState('')
  const searchId = useId()
  const visibleProducts = filterProductsByTitle(products, query)
  const statusBlock = useRef<HTMLDivElement>(null)
  const focusAfterRetry = useRef(false)
  const loading = status === 'idle' || status === 'loading'
  const empty = status === 'success' && products.length === 0
  const noMatch = status === 'success' && products.length > 0 && visibleProducts.length === 0
  const hasProducts = status === 'success' && visibleProducts.length > 0

  useEffect(() => {
    if (useCatalogStore.getState().status === 'idle') void loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (focusAfterRetry.current) {
      statusBlock.current?.focus()
      focusAfterRetry.current = false
    }
  }, [status])

  function retry() {
    focusAfterRetry.current = true
    void loadProducts()
  }

  return (
    <section aria-label="Товари" aria-busy={loading}>
      {status === 'success' && (
        <div className="catalog-search">
          <label className="catalog-search__label" htmlFor={searchId}>Пошук за назвою</label>
          <input
            id={searchId}
            className="catalog-search__input"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      )}
      <div
        ref={statusBlock}
        tabIndex={-1}
        className={hasProducts ? 'catalog-status catalog-status--quiet' : 'catalog-status'}
      >
        {loading && <p role="status">Завантаження товарів…</p>}
        {empty && <p role="status">Товарів немає</p>}
        {noMatch && <p role="status">За вашим запитом товарів не знайдено</p>}
        {status === 'error' && (
          <>
            <p role="alert" className="catalog-error">{error}</p>
            <button type="button" className="catalog-retry" onClick={retry}>Спробувати ще</button>
          </>
        )}
      </div>
      {hasProducts && (
        <ul className="catalog-list">
          {visibleProducts.map((product) => (
            <li key={product.id}><ProductCard product={product} /></li>
          ))}
        </ul>
      )}
    </section>
  )
}
