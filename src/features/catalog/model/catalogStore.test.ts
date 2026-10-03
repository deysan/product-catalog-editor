import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useCatalogStore } from './catalogStore'

const product = { id: 1, title: 'Товар', price: 0, thumbnail: 'https://example.com/a' }
const errorText = 'Не вдалося завантажити товари. Спробуйте ще раз.'
beforeEach(() => useCatalogStore.setState({ products: [], initialProducts: [], status: 'idle', error: null }))
afterEach(() => vi.unstubAllGlobals())
test('початковий стан порожній', () => {
  expect(useCatalogStore.getState()).toMatchObject({ products: [], initialProducts: [], status: 'idle', error: null })
})
test.each([{ products: [product] }, { products: [] }])('успіх атомарно створює незалежний знімок %j', async ({ products }) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ products }) }))
  await useCatalogStore.getState().loadProducts()
  const state = useCatalogStore.getState()
  expect(state).toMatchObject({ products, initialProducts: products, status: 'success', error: null })
  expect(state.products).not.toBe(state.initialProducts)
  if (products.length) {
    expect(state.products[0]).not.toBe(state.initialProducts[0])
    expect(state.products[0]).not.toBe(products[0])
    state.products[0].title = 'Зміна'
    expect(state.initialProducts[0].title).toBe('Товар')
  }
  await state.loadProducts()
  expect(fetch).toHaveBeenCalledTimes(1)
})
test('loading синхронний, повторні виклики не починають запит', async () => {
  let resolve!: (value: unknown) => void
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise((done) => { resolve = done })))
  const attempt = useCatalogStore.getState().loadProducts()
  expect(useCatalogStore.getState()).toMatchObject({ status: 'loading', error: null, products: [], initialProducts: [] })
  await useCatalogStore.getState().loadProducts()
  expect(fetch).toHaveBeenCalledTimes(1)
  resolve({ ok: true, json: async () => ({ products: [product] }) })
  await attempt
  expect(useCatalogStore.getState().status).toBe('success')
})
test.each(['network', 'http', 'json', 'invalid'])('помилка %s і ручний retry', async (kind) => {
  const fetchMock = vi.fn()
  if (kind === 'network') fetchMock.mockRejectedValueOnce(new Error('secret'))
  else fetchMock.mockResolvedValueOnce({ ok: kind !== 'http', json: async () => {
    if (kind === 'json') throw new Error('secret')
    return { products: [product, { ...product, id: 2, price: -1 }] }
  } })
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ products: [product] }) })
  vi.stubGlobal('fetch', fetchMock)
  await useCatalogStore.getState().loadProducts()
  expect(useCatalogStore.getState()).toMatchObject({ status: 'error', error: errorText, products: [], initialProducts: [] })
  expect(fetch).toHaveBeenCalledTimes(1)
  const retry = useCatalogStore.getState().loadProducts()
  expect(useCatalogStore.getState()).toMatchObject({ status: 'loading', error: null })
  await retry
  expect(useCatalogStore.getState().status).toBe('success')
  expect(fetch).toHaveBeenCalledTimes(2)
})
