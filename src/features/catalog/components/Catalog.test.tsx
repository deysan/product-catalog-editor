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

const searchProducts = [
  { ...product, id: 7, title: 'Apple Juice' },
  { ...product, id: 2, title: 'Pineapple' },
  { ...product, id: 9, title: 'Milk' },
]
const visibleTitles = () => screen.queryAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)

test('відкрите поле з видимою міткою оновлює картки без submit і повертає каталог після очищення', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(searchProducts)))
  render(<Catalog />)
  const input = await screen.findByRole('textbox', { name: 'Пошук за назвою' })
  expect(screen.getByText('Пошук за назвою', { selector: 'label' })).toBeVisible()
  expect(screen.getByLabelText('Пошук за назвою')).toBe(input)
  expect(input).toHaveAttribute('type', 'text')
  expect(input).toHaveValue('')
  expect(input).toBeEnabled()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  input.focus()
  for (const query of ['aPpLe', '  apple  ']) {
    fireEvent.change(input, { target: { value: query } })
    expect(visibleTitles()).toEqual(['Apple Juice', 'Pineapple'])
    expect(input).toHaveValue(query)
    expect(input).toHaveFocus()
  }
  for (const query of ['', '   ']) {
    fireEvent.change(input, { target: { value: query } })
    expect(visibleTitles()).toEqual(searchProducts.map((item) => item.title))
    expect(input).toHaveFocus()
  }
  expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'false')
})

test('no-match має власний status без retry; зміна запиту й очищення відновлюють результати та фокус', () => {
  useCatalogStore.setState({ products: searchProducts, initialProducts: searchProducts.map((item) => ({ ...item })), status: 'success' })
  vi.stubGlobal('fetch', vi.fn())
  render(<Catalog />)
  const input = screen.getByRole('textbox', { name: 'Пошук за назвою' })
  input.focus()
  for (const query of ['missing', 'another missing']) {
    fireEvent.change(input, { target: { value: query } })
    expect(screen.getByRole('status')).toHaveTextContent(/^За вашим запитом товарів не знайдено$/)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBe(input)
    expect(input).toBeEnabled()
    expect(input).toHaveFocus()
  }
  fireEvent.change(input, { target: { value: 'milk' } })
  expect(visibleTitles()).toEqual(['Milk'])
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  fireEvent.change(input, { target: { value: '' } })
  expect(visibleTitles()).toEqual(searchProducts.map((item) => item.title))
  expect(input).toHaveFocus()
})

test.each(['', '   ', 'apple'])('порожній каталог має пріоритет над no-match для %j', (query) => {
  useCatalogStore.setState({ status: 'success' })
  vi.stubGlobal('fetch', vi.fn())
  render(<Catalog />)
  const input = screen.getByRole('textbox', { name: 'Пошук за назвою' })
  fireEvent.change(input, { target: { value: query } })
  expect(screen.getByRole('status')).toHaveTextContent(/^Товарів немає$/)
  expect(screen.queryByText('За вашим запитом товарів не знайдено')).not.toBeInTheDocument()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(input).toBeEnabled()
})

test('пошукові дії зберігають усі дані й посилання каталогу та знімка без нових fetch', async () => {
  const fetchMock = vi.fn().mockResolvedValue(response(searchProducts))
  vi.stubGlobal('fetch', fetchMock)
  render(<Catalog />)
  const input = await screen.findByRole('textbox', { name: 'Пошук за назвою' })
  const { products, initialProducts } = useCatalogStore.getState()
  const beforeProducts = structuredClone(products)
  const beforeSnapshot = structuredClone(initialProducts)
  const requestCount = fetchMock.mock.calls.length
  expect(requestCount).toBe(1)
  expect(products).not.toBe(initialProducts)
  for (const query of ['aPpLe', '  milk  ', 'missing', '<script>alert(1)</script>', '   ', '']) {
    fireEvent.change(input, { target: { value: query } })
    const state = useCatalogStore.getState()
    expect(fetchMock).toHaveBeenCalledTimes(requestCount)
    expect(state.products).toEqual(beforeProducts)
    expect(state.initialProducts).toEqual(beforeSnapshot)
    expect(state.products).toBe(products)
    expect(state.initialProducts).toBe(initialProducts)
  }
  expect(visibleTitles()).toEqual(beforeProducts.map((item) => item.title))
})

test('активний запит реагує на перейменування й видалення поточних товарів, зберігаючи знімок', () => {
  const snapshot = searchProducts.map((item) => ({ ...item }))
  const snapshotBefore = structuredClone(snapshot)
  useCatalogStore.setState({ products: searchProducts.map((item) => ({ ...item })), initialProducts: snapshot, status: 'success' })
  vi.stubGlobal('fetch', vi.fn())
  render(<Catalog />)
  const input = screen.getByRole('textbox', { name: 'Пошук за назвою' })
  input.focus()
  fireEvent.change(input, { target: { value: '  aPpLe  ' } })
  expect(visibleTitles()).toEqual(['Apple Juice', 'Pineapple'])
  const renamed = [
    { ...searchProducts[0], title: 'Orange Juice' },
    searchProducts[1],
    { ...searchProducts[2], title: 'Apple Milk' },
  ]
  act(() => useCatalogStore.setState({ products: renamed }))
  expect(visibleTitles()).toEqual(['Pineapple', 'Apple Milk'])
  act(() => useCatalogStore.setState({ products: renamed.slice(2) }))
  expect(visibleTitles()).toEqual(['Apple Milk'])
  act(() => useCatalogStore.setState({ products: [renamed[0]] }))
  expect(screen.getByRole('status')).toHaveTextContent(/^За вашим запитом товарів не знайдено$/)
  expect(visibleTitles()).toEqual([])
  act(() => useCatalogStore.setState({ products: [] }))
  expect(screen.getByRole('status')).toHaveTextContent(/^Товарів немає$/)
  expect(input).toHaveValue('  aPpLe  ')
  expect(input).toHaveFocus()
  expect(screen.getByRole('textbox')).toBe(input)
  expect(useCatalogStore.getState().initialProducts).toBe(snapshot)
  expect(useCatalogStore.getState().initialProducts).toEqual(snapshotBefore)
  expect(fetch).not.toHaveBeenCalled()
})
