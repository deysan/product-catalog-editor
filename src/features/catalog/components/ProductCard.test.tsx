import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { ProductCard } from './ProductCard'

const product = { id: 1, title: '  <b>Повна назва</b>  ', price: 12.5, thumbnail: 'https://example.com/a.png' }
test('показує точні дані, HTML назви залишається текстом', () => {
  const { container } = render(<ProductCard product={product} />)
  expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(product.title)
  expect(container.querySelector('b')).toBeNull()
  const image = screen.getByRole('img')
  expect(image).toHaveAttribute('src', product.thumbnail)
  expect(image).toHaveAttribute('alt', product.title)
  expect(screen.getByText('12.50')).toBeInTheDocument()
  expect(container.querySelector('[tabindex]')).toBeNull()
})
test('збій фото локальний, решта даних і карток залишаються', () => {
  render(<><ProductCard product={product} /><ProductCard product={{ ...product, id: 2, title: 'Інший' }} /></>)
  fireEvent.error(screen.getAllByRole('img')[0])
  expect(screen.getByText('Фото недоступне')).toBeInTheDocument()
  expect(screen.getAllByRole('heading')).toHaveLength(2)
  expect(screen.getAllByText('12.50')).toHaveLength(2)
  expect(screen.getByRole('img')).toHaveAttribute('alt', 'Інший')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
test('ціна нуль має два десяткові знаки', () => {
  render(<ProductCard product={{ ...product, price: 0 }} />)
  expect(screen.getByText('0.00')).toBeInTheDocument()
})
