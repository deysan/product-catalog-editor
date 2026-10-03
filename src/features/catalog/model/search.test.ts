import { expect, test } from 'vitest'
import { filterProductsByTitle } from './search'
import type { Product } from './types'

const product: Product = { id: 1, title: 'Apple Juice', price: 12.5, thumbnail: 'https://example.com/apple.png' }
const products = [product, { ...product, id: 2, title: 'Pineapple' }, { ...product, id: 3, title: 'Milk' }]

test('шукає лише підрядок назви без урахування регістру, зберігаючи порядок', () => {
  expect(filterProductsByTitle(products, 'aPpLe')).toEqual(products.slice(0, 2))
  expect(filterProductsByTitle(products, '12.5')).toEqual([])
  expect(filterProductsByTitle([products[2]], 'apple')).toEqual([])
})

test.each(['apple', '  apple  ', '\tAPPLE\n'])('ігнорує крайні пробіли для %j', (query) => {
  expect(filterProductsByTitle(products, query)).toEqual(products.slice(0, 2))
})

test.each(['', '   ', '\t\n'])('порожній запит %j повертає весь каталог', (query) => {
  expect(filterProductsByTitle(products, query)).toEqual(products)
})

test.each(['.*', '[', '*', '"', '<b>', 'Apple  Juice'])('порівнює %j буквально', (title) => {
  const literal = { ...product, id: 4, title }
  expect(filterProductsByTitle([...products, literal], title)).toEqual([literal])
})

test('не додає приблизні збіги або нормалізацію внутрішніх пробілів', () => {
  expect(filterProductsByTitle(products, 'aple')).toEqual([])
  expect(filterProductsByTitle(products, 'apple  juice')).toEqual([])
})

test.each(Array.from({ length: 21 }, (_, count) => count))('працює з %i товарами без мутації', (count) => {
  const input = Object.freeze(Array.from({ length: count }, (_, i) => Object.freeze({
    ...product, id: count - i, title: i % 2 ? 'Milk' : 'Apple Juice',
  })))
  const before = structuredClone(input)
  expect(filterProductsByTitle(input, 'apple')).toEqual(input.filter((item) => item.title === 'Apple Juice'))
  expect(filterProductsByTitle(input, 'missing')).toEqual([])
  expect(filterProductsByTitle(input, '')).toEqual(input)
  expect(input).toEqual(before)
})
