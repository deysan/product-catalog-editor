---
status: current
mode: greenfield-bootstrap
updated_at: "2026-10-03"
reflects_commit: "31ee1e9"
language: "TypeScript"
build_cmd: "npm run build" # verified: tsc -b && vite build
test_cmd: "npm run test -- --run" # verified: vitest --run
lint_cmd: "npm run lint" # verified: eslint .
migration_tool: "" # N/A: no database
frontend: "React + Vite + Zustand + vanilla CSS"
---

# Architecture map — Product Catalog Editor

Погоджена архітектура навчального проєкту; skeleton матеріалізовано 2026-10-03. Є package.json, package-lock.json, entry point, мінімальний App, базовий CSS, Vitest smoke-тест і ESLint. Модуль каталогу має порожні каталоги api/model/components; бізнес-функції ще заплановані. reflects_commit позначає HEAD до коміту scaffold. Підстава: [бриф](idea-brief.md), підтверджені автором рішення цього survey. Route: **quick**, depth: **easy**; формальну feature_size ще не класифіковано.

## Stack

- TypeScript зі strict-перевіркою, React, Vite; менеджер пакетів npm. Залежності встановлено; точні версії зафіксовано в package-lock.json. Node.js 22.12+; перевірено на Node.js 24.19.0 і npm 11.17.0.
- Zustand для каталогу та локальних змін; fetch для початкового завантаження й повторної спроби; useState для чернетки форми.
- Звичайний CSS, без бібліотеки компонентів, роутера й серверної частини.
- Робочі команди: `npm run dev` (Vite), `npm run build` (`tsc -b && vite build`), `npm run test -- --run` (Vitest у разовому режимі), `npm run lint` (ESLint). Build, test і lint виконано успішно; dev-сервер і мінімальний екран перевірено в Chrome.
- Налаштована перевірка компонентів: React Testing Library, середовище jsdom. CI поза першою версією.
- Рішення: [ADR-001](adr/001-toolchain.md), [ADR-002](adr/002-catalog-module.md), [ADR-003](adr/003-ephemeral-state.md).

## C4 — target baseline

Діаграма показує користувача, браузерний застосунок і зовнішнє джерело. Zustand і useState — внутрішній стан застосунку, не окремі сервіси.

```mermaid
flowchart LR
    learner["Учасник воркшопу — практикує Codex і SDD"]
    app["Браузерний Product Catalog Editor<br/>React, TypeScript, Zustand<br/>Каталог, пошук і локальне редагування"]
    dummy["DummyJSON — джерело товарів"]
    learner -->|"Переглядає та змінює каталог"| app
    app -->|"Завантажує 20 товарів або повторює невдалий запит — HTTPS / fetch"| dummy
```

## Module inventory

App, main, base.css і test/setup.ts створено. Каталоги api/model/components збережено через .gitkeep; їхні модулі та catalog.css залишаються планом.

| Module | Path | Layers | Wired at | Responsibility |
|---|---|---|---|---|
| App | `src/main.tsx`, `src/App.tsx` | composition | `src/main.tsx` | Монтування React та єдиного екрана каталогу |
| Catalog API | `src/features/catalog/api/products.ts` | external I/O | `model/catalogStore.ts` | GET, перевірка HTTP-відповіді та потрібних полів, перетворення на Product |
| Catalog model | `src/features/catalog/model/` | types, store, selectors | `components/Catalog.tsx` | Product, список, початковий знімок, статус, помилка й дії |
| Catalog UI | `src/features/catalog/components/` | presentation, form | `src/App.tsx` | Catalog, ProductCard, ProductForm, пошук і стани запиту |
| Styles | `src/styles/` | presentation | `src/main.tsx` | Базові стилі, CSS-змінні та класи каталогу |
| Test setup | `src/test/setup.ts` | test infrastructure | `vite.config.ts` | Налаштування Vitest, DOM і очищення після тестів |

## Conventions (cited — the rules a new feature must match)

Правила закріплено в AGENTS.md; посилання нижче ведуть на погоджені ADR.

- **Module wiring:** прямі імпорти в одному модулі; UI звертається до store, store — до API; API не імпортує UI або store. Без універсальних шарів і barrel-файлів за замовчуванням — [ADR-002](adr/002-catalog-module.md).
- **Error handling:** статус `idle | loading | success | error` і зрозуміле повідомлення в store; fetch перевіряє `response.ok`, помилки перехоплюються на межі store, UI показує повторну спробу — [ADR-003](adr/003-ephemeral-state.md).
- **IDs:** використовувати числовий id від DummyJSON як ключ і аргумент локальних дій; не генерувати нові id — [ADR-003](adr/003-ephemeral-state.md).
- **Persistence:** лише пам’ять вкладки; оновлювати товари незмінними операціями, початковий знімок не редагувати — [ADR-003](adr/003-ephemeral-state.md).
- **Migrations:** N/A, немає бази даних — [ADR-003](adr/003-ephemeral-state.md).
- **Tests:** Vitest + React Testing Library, файли `*.test.ts` / `*.test.tsx` поруч із модулем; ізоляція store між тестами, fetch підмінюється, тести не залежать від мережі — [ADR-001](adr/001-toolchain.md).
- **UI / styling:** звичайний CSS у `src/styles`, семантичні елементи, label для полів, явний type кнопок; PascalCase для компонентів, camelCase для функцій і змінних — [ADR-002](adr/002-catalog-module.md).
- **CI:** поза першою версією; перевірки запускаються локально — [ADR-001](adr/001-toolchain.md).

## Datastores

| Store | Engine | Accessed via | Notes |
|---|---|---|---|
| Поточні товари й початковий знімок | Zustand у пам’яті | catalogStore | Знімок створюється після успішного завантаження; reset відновлює окремі копії товарів без запиту |
| Чернетка назви й ціни | React useState | ProductForm | Save застосовує зміни до store; Cancel відкидає чернетку |

Серверний запис, localStorage і міграції не потрібні. Мінімальний Product: `id`, `title`, `price`, `thumbnail`. Завантаження нормалізує лише потрібні поля, без збереження всього зовнішнього об’єкта. Повторна спроба стосується невдалого завантаження; звичайні локальні дії не виконують запитів. Джерело: [бриф §1, §5, §7](idea-brief.md), [ADR-003](adr/003-ephemeral-state.md).

## Frontend / UI foundation

- Є мінімальний App із заголовком та повідомленням-заглушкою; бібліотека компонентів не планується.
- Створено `src/styles/base.css` з базовими кольорами, системним шрифтом і змінною відступів; `src/styles/catalog.css` буде додано під час реалізації каталогу.
- Один екран Catalog, ProductCard і ProductForm; loading, error із retry, порожній результат пошуку — стани цього екрана, не окремі маршрути.
- Пошуковий рядок і відкритий редактор — локальний стан компонента; відфільтрований список обчислюється з актуальних товарів, не зберігається дублем у store.
- Чернетка форми не змінює каталог до Save; скидання відновлює початковий завантажений список без fetch. Деталі закриття форми під час reset ще не визначені.
- Основа для майбутнього повторного використання: [ADR-002](adr/002-catalog-module.md) та [ADR-003](adr/003-ephemeral-state.md).

## Where things live / closest precedents

- Логіка товарів — `src/features/catalog/model`; взаємодія з зовнішнім джерелом — `api`; компоненти — `components`.
- Перевірки store та API — поруч із відповідними файлами; інтеграційні перевірки UI — поруч із Catalog / ProductForm.
- Прецедент монтування — src/App.test.tsx; бізнес-коду каталогу ще немає. Перший майбутній крок — завантаження й стани; далі пошук, редагування, видалення й скидання, з перевіркою після кожного кроку ([бриф §7](idea-brief.md)).

## Constraints & known tech-debt

- Усі заявлені функції зберігаємо; просте оформлення, орієнтир 2–3 години не є підтвердженим дедлайном.
- Без backend, авторизації, localStorage, TanStack Query, пагінації, серверного пошуку й запису; CI також поза першою версією.
- Відкрито для специфікації: правила валідації назви/ціни, поведінка форми під час reset, точна семантика пошуку. Це не підстава розширювати фундамент.
- Виконані smoke-перевірки: build проходить, App монтується (1 тест), lint проходить, dev-екран відображається в Chrome. Міграційна перевірка N/A.
- Scaffold виконав S1–S4; функції каталогу не реалізовано. Деталі перевірок — docs/features/_scaffold/tracker.md.

## Reconciliation with the authored architecture doc

Окремого авторського архітектурного документа немає. Бриф збережено без змін; ця карта є цільовою основою з трьома ADR. Існуючі локальні налаштування SDD не змінено: явні вказівки автора задають українську мову, quick та easy для цього запуску.
