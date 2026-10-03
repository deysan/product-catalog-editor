import { afterEach, expect, test, vi } from 'vitest'
import { fetchProducts } from './products'

const product = { id: 1, title: '  Назва  ', price: 12.5, thumbnail: 'https://example.com/a.png' }
const respond = (data: unknown) => vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => data }))
afterEach(() => vi.unstubAllGlobals())

test.each([0, 1, 20])('повертає %i окремих товарів у порядку джерела', async (count) => {
  const products = Array.from({ length: count }, (_, i) => ({ ...product, id: i + 1, extra: true }))
  respond({ products, total: 200 })
  const result = await fetchProducts()
  expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/products?limit=20&skip=0')
  expect(result).toEqual(products.map(({ id, title, price, thumbnail }) => ({ id, title, price, thumbnail })))
  expect(result).not.toBe(products)
  result.forEach((item, i) => expect(item).not.toBe(products[i]))
})

const invalidProducts = [
  null, [], { ...product, id: 0 }, { ...product, id: -1 }, { ...product, id: 1.5 },
  { ...product, id: '1' }, { ...product, title: '' }, { ...product, title: '  ' },
  { ...product, title: 1 }, { ...product, price: -1 }, { ...product, price: NaN },
  { ...product, price: Infinity }, { ...product, price: '12' },
  { ...product, thumbnail: '/a.png' }, { ...product, thumbnail: 'bad' },
  { ...product, thumbnail: 'ftp://example.com/a' }, { ...product, thumbnail: 1 },
]
test.each(invalidProducts)('відхиляє весь набір із некоректним останнім товаром %j', async (invalid) => {
  respond({ products: [{ ...product, id: 99 }, invalid] })
  await expect(fetchProducts()).rejects.toThrow()
})
test.each([null, [], {}, { products: null }, { products: {} },
  { products: [product, product] },
  { products: Array.from({ length: 21 }, (_, i) => ({ ...product, id: i + 1 })) },
])('відхиляє некоректний набір %j', async (data) => {
  respond(data)
  await expect(fetchProducts()).rejects.toThrow()
})
test('приймає нульову ціну та HTTP без нормалізації', async () => {
  respond({ products: [{ ...product, price: 0, thumbnail: 'http://example.com/a' }] })
  expect(await fetchProducts()).toEqual([{ ...product, price: 0, thumbnail: 'http://example.com/a' }])
})
test.each(['network', 'http', 'json'])('відхиляє збій %s', async (kind) => {
  vi.stubGlobal('fetch', kind === 'network'
    ? vi.fn().mockRejectedValue(new Error('network'))
    : vi.fn().mockResolvedValue({ ok: kind !== 'http', json: async () => { throw new Error('json') } }))
  await expect(fetchProducts()).rejects.toThrow()
})
