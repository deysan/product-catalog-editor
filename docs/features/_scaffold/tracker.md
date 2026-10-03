# Scaffold tracker

Дата: 2026-10-03. S1–S4 виконано послідовно за tasks.json.
Scaffold — структурний етап без feature_size / .route.

| Task | Status | Evidence |
|---|---|---|
| S1 | done | Entry point, App, CSS, strict TypeScript, Vite, npm та порожні api/model/components створено; build проходить; мінімальний екран відображається в Chrome |
| S2 | done | Vitest + React Testing Library + jsdom; smoke-тест App: 1/1 pass; мережевих запитів немає |
| S3 | done | ESLint налаштовано; npm run lint і npm run build завершилися з кодом 0 |
| S4 | done | AGENTS.md узгоджено з картою й ADR; усі перевірки пройдено |

RED: до scaffold `npm run build` завершився ENOENT — package.json був відсутній.
GREEN: `npm run build`, `npm run test -- --run`, `npm run lint` — exit 0.
`npm run dev -- --host 127.0.0.1` — Vite ready; Chrome показує заголовок
Product Catalog Editor та українське повідомлення-заглушку.

Node.js 24.19.0, npm 11.17.0. Точні залежності — package-lock.json.
Міграції N/A: база даних відсутня. CI не створено за ADR-001.
Функції каталогу не реалізовано, Zustand лише встановлено.
