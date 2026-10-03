# Product Catalog Editor

## Scope

Навчальний браузерний застосунок. Джерело архітектурних рішень —
`docs/architecture-map.md` і `docs/adr/001-toolchain.md`–`003-ephemeral-state.md`.
Skeleton містить лише мінімальний екран; функції каталогу реалізовуються за окремими специфікаціями.

## Stack and commands

React + Vite + TypeScript (strict), npm, Zustand, звичайний CSS.
Використовуйте Node.js 22.12+ (сумісний із зафіксованим toolchain).

- `npm ci` — відтворюване встановлення з `package-lock.json`.
- `npm run dev` — локальний сервер Vite.
- `npm run build` — TypeScript-перевірка й production build.
- `npm run test -- --run` — Vitest + React Testing Library у jsdom.
- `npm run lint` — ESLint.
- `npm run preview` — перегляд production build.

Перед завершенням зміни запускайте build, відповідні тести та lint.

## Structure and conventions

- `src/main.tsx` монтує React, `src/App.tsx` складає екран.
- `src/features/catalog/api/` — зовнішні запити через fetch.
- `src/features/catalog/model/` — типи, Zustand store й селектори.
- `src/features/catalog/components/` — компоненти та форма.
- `src/styles/` — звичайний CSS; базові стилі в `base.css`.
- Прямі імпорти: UI → model → api. API не імпортує UI або store.
  Не додавайте barrel-файли, універсальні шари чи shared/ui без реальної потреби.
- Компоненти — PascalCase, функції та змінні — camelCase.
- Семантичний HTML, label для полів, явний type для кнопок.

## Future catalog constraints

- Product має числовий id джерела, title, price, thumbnail.
- fetch перевіряє response.ok та потрібні поля; помилки перехоплюються в store.
- Статуси: idle, loading, success, error; повідомлення помилки й retry доступні UI.
- Каталог і незмінний початковий знімок живуть у Zustand, чернетка форми — у useState.
- Зміни незмінні; reset відновлює окремі копії зі знімка без нового запиту.
- Відфільтрований список обчислюється, а не зберігається дублем у store.
- Без backend, авторизації, localStorage, роутера, UI kit та TanStack Query.
- База даних і міграції N/A; CI поза першою версією.

## Tests

Тести `*.test.ts` / `*.test.tsx` розташовуйте поруч із модулем.
`src/test/setup.ts` додає DOM matchers і cleanup після кожного тесту.
Ізолюйте store між тестами та підмінюйте fetch: тести не залежать від мережі.
Smoke-тест App перевіряє монтування мінімального екрана.
