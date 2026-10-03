import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App'
import { useCatalogStore } from './features/catalog/model/catalogStore'

beforeEach(() => {
  useCatalogStore.setState({ products: [], initialProducts: [], status: 'idle', error: null })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ products: [] }) }))
})
afterEach(() => vi.unstubAllGlobals())

test('застосунок монтує публічний каталог', async () => {
  render(<App />)
  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1, name: 'Каталог товарів' })).toBeInTheDocument()
  expect(await screen.findByText('Товарів немає')).toBeInTheDocument()
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
