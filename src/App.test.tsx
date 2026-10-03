import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App'

test('мінімальний застосунок монтується', () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { level: 1, name: 'Product Catalog Editor' }),
  ).toBeInTheDocument()
})
