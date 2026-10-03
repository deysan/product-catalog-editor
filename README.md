# Product Catalog Editor

A React pet project built to practice specification-driven development with Codex. It loads a product catalog from [DummyJSON](https://dummyjson.com/) and keeps catalog state in Zustand.

## Current features

- Fetch up to 20 products and validate the response.
- Show product images, titles and prices with two decimal places.
- Handle loading, empty results and errors with a manual retry.
- Show a fallback when a product image is unavailable.
- Keep a separate initial snapshot in memory for future local editing and reset.

Search, editing, deletion and reset are planned in [the roadmap](docs/roadmap.md). The current version implements catalog loading only.

## Stack

React, TypeScript, Vite, Zustand, native fetch and plain CSS. Tests use Vitest and React Testing Library.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Checks

```sh
npm run build
npm run test -- --run
npm run lint
```

Tests mock network requests and do not depend on DummyJSON availability.

## Project structure

- `src/features/catalog/api` — fetching and response validation.
- `src/features/catalog/model` — product types and Zustand store.
- `src/features/catalog/components` — catalog screen and product cards.
- `src/styles` — application styles.
- `docs` — specifications, architecture decisions, task plans and reviews.

See [the architecture map](docs/architecture-map.md) and [catalog specification](docs/features/catalog-loading/spec.md) for details.

This is a learning project. Data is kept in memory and is lost on page reload; there is no backend or authentication.
