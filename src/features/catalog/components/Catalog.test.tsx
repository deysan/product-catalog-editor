import { StrictMode } from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Catalog } from './Catalog'
import { useCatalogStore } from '../model/catalogStore'

const product = { id: 1, title: 'Перший', price: 12.5, thumbnail: 'https://example.com/a.png' }
const errorText = 'Не вдалося завантажити товари. Спробуйте ще раз.'
const response = (products: unknown[]) => ({ ok: true, json: async () => ({ products }) })
beforeEach(() => useCatalogStore.setState({ products: [], initialProducts: [], status: 'idle', error: null }))
afterEach(() => vi.unstubAllGlobals())

test('StrictMode починає одну спробу, loading не перехоплює фокус', async () => {
  let resolve!: (value: unknown) => void
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise((done) => { resolve = done })))
  const focusBefore = document.activeElement
  render(<StrictMode><Catalog /></StrictMode>)
  expect(screen.getByRole('status')).toHaveTextContent('Завантаження товарів…')
  expect(screen.getByRole('region', { name: 'Товари' })).toHaveAttribute('aria-busy', 'true')
  expect(document.activeElement).toBe(focusBefore)
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
  expect(fetch).toHaveBeenCalledTimes(1)
  await act(async () => { resolve(response([product])) })
  expect(await screen.findByRole('list')).toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'false')
})

test.each([1, 20])('показує всі %i карток у порядку джерела', async (count) => {
  const products = Array.from({ length: count }, (_, i) => ({ ...product, id: i + 1, title: 'Товар ' + i }))
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(products)))
  render(<Catalog />)
  const list = await screen.findByRole('list')
  const cards = within(list).getAllByRole('listitem')
  expect(cards).toHaveLength(count)
  cards.forEach((card, i) => expect(within(card).getByRole('heading')).toHaveTextContent(products[i].title))
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('порожній успіх не повторює запит навіть після remount', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([])))
  const view = render(<Catalog />)
  expect(await screen.findByText('Товарів немає')).toHaveAttribute('role', 'status')
  view.unmount()
  render(<Catalog />)
  expect(screen.getByText('Товарів немає')).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
  expect(fetch).toHaveBeenCalledTimes(1)
})

test.each(['network', 'http', 'json', 'invalid'])('збій %s не дає карток або автоматичного retry на remount', async (kind) => {
  vi.stubGlobal('fetch', kind === 'network' ? vi.fn().mockRejectedValue(new Error('secret'))
    : vi.fn().mockResolvedValue({ ok: kind !== 'http', json: async () => {
      if (kind === 'json') throw new Error('secret')
      return { products: [product, { ...product, id: 2, price: -1 }] }
    } }))
  const view = render(<Catalog />)
  expect(await screen.findByRole('alert')).toHaveTextContent(errorText)
  expect(screen.getByRole('button', { name: 'Спробувати ще' })).toHaveAttribute('type', 'button')
  expect(screen.queryByText('secret')).not.toBeInTheDocument()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  view.unmount()
  render(<StrictMode><Catalog /></StrictMode>)
  expect(screen.getByRole('alert')).toHaveTextContent(errorText)
  expect(fetch).toHaveBeenCalledTimes(1)
})

test.each(['products', 'empty', 'error'])('retry → loading → %s з постійним фокусом', async (result) => {
  let resolve!: (value: unknown) => void
  const fetchMock = vi.fn().mockRejectedValueOnce(new Error('secret'))
    .mockImplementationOnce(() => new Promise((done) => { resolve = done }))
    .mockResolvedValueOnce(response([product]))
  vi.stubGlobal('fetch', fetchMock)
  render(<Catalog />)
  const button = await screen.findByRole('button', { name: 'Спробувати ще' })
  button.focus()
  fireEvent.click(button)
  const status = screen.getByRole('status').parentElement!
  expect(status).toHaveTextContent('Завантаження товарів…')
  expect(status).toHaveFocus()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  await act(async () => { await useCatalogStore.getState().loadProducts() })
  expect(fetch).toHaveBeenCalledTimes(2)
  await act(async () => { resolve(result === 'error' ? { ok: false } : response(result === 'empty' ? [] : [product])) })
  expect(document.activeElement).toBe(status)
  expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'false')
  if (result === 'products') expect(screen.getByRole('listitem')).toBeInTheDocument()
  if (result === 'empty') expect(screen.getByRole('status')).toHaveTextContent('Товарів немає')
  if (result === 'error') {
    expect(screen.getByRole('alert')).toHaveTextContent(errorText)
    fireEvent.click(screen.getByRole('button'))
    expect(await screen.findByRole('list')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(3)
  }
})

test('remount під час запиту і після успіху не робить нової спроби; фото має локальну заглушку', async () => {
  let resolve!: (value: unknown) => void
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise((done) => { resolve = done })))
  const view = render(<Catalog />)
  view.unmount()
  const next = render(<Catalog />)
  expect(fetch).toHaveBeenCalledTimes(1)
  await act(async () => { resolve(response([product, { ...product, id: 2, title: 'Другий' }])) })
  fireEvent.error(screen.getAllByRole('img')[0])
  expect(screen.getByText('Фото недоступне')).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  next.unmount()
  render(<Catalog />)
  expect(fetch).toHaveBeenCalledTimes(1)
})
