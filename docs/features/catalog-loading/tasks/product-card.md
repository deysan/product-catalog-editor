---
id: "T3"
title: "Показати картку та заміну недоступного фото"
layer: "ui"
deps: ["T2"]
blocks: ["T4"]
acs: ["AC-02", "AC-09"]
files_hint: ["src/features/catalog/components/ProductCard.tsx", "src/features/catalog/components/ProductCard.test.tsx", "src/styles/catalog.css"]
owner: "Автор навчального проєкту"
estimate: "2–4h"
context_budget: "M"
status: "done"
---

# T3 — Показати картку та заміну недоступного фото

## Place in the sequence

Передумова: ['T2']. Блокує: ['T4']. Хвиля 3. Послідовний план за вказівкою автора; T3/T4 спільно змінюють catalog.css.

## Why (user story)

> **As a** Учасник воркшопу **I want** бачити фото, назву й ціну кожного товару **So that** розпізнати позицію каталогу.
>
> — `spec.md §4, US-02, verbatim` · [spec.md](../spec.md)

Задача забезпечує відповідну частину потоку початкового каталогу.

## Inlined context

> при відкритті екрана автоматично запитувати до 20 перших товарів із DummyJSON і показувати отримані картки, очікування, порожній стан або помилку з ручною повторною спробою. Пошук і локальні зміни належать наступним крокам.
>
> — `spec.md §1, погоджений підхід, verbatim` · [spec.md](../spec.md)
> `product`, список використовує `product.id` як React key. Ціну відображаємо через `price.toFixed(2)`, назву — як текст у `h2`, без HTML-інтерпретації. Фото має `alt={product.title}`; `onError` перемикає локальний `useState` на «Фото недоступне» й прибирає зламаний `img`, не змінюючи store. У цьому кроці товар і адреса фото після успіху незмінні.
>
> — `sad.md §4–6, T3, abridged` · [sad.md](../sad.md)

> React + Vite + TypeScript, npm, fetch, звичайний CSS; Vitest + React Testing Library з jsdom та ESLint. TypeScript strict. CI поза першою версією. Версії залежностей фіксуємо під час майбутнього scaffold.
>
> — `001-toolchain.md §Decision, 001-toolchain, verbatim` · [001-toolchain.md](../../../adr/001-toolchain.md)
> src/features/catalog із api, model, components; src/App.tsx складає один екран, src/styles містить звичайний CSS. Прямі залежності UI → model → api; API не залежить від UI/store.
>
> — `002-catalog-module.md §Decision, 002-catalog-module, verbatim` · [002-catalog-module.md](../../../adr/002-catalog-module.md)
> Zustand тримає поточні товари, незмінний початковий знімок, статус і помилку. useState тримає незбережені поля форми. Лише GET через fetch, без постійного сховища.
>
> — `003-ephemeral-state.md §Decision, 003-ephemeral-state, verbatim` · [003-ephemeral-state.md](../../../adr/003-ephemeral-state.md)
> Не більше 1 активної спроби завантаження на вкладку; 0 автоматичних повторів. 0 реальних мережевих звернень у автоматизованих тестах; 100% сценаріїв §5 мають перевірку.
>
> — `spec.md §6, NFR, abridged` · [spec.md](../spec.md)
> SCR-01: success / photo-unavailable. ProductCard: фото 160px, назва h2, ціна без валюти, «Фото недоступне» замість зламаного img.
>
> — `screens.md §Screens, SCR-01, abridged` · [screens.md](../screens.md)
> Повторно використати App (main, h1, .app-shell), базовий CSS та погоджені --color-* і --space-unit. Catalog/ProductCard — заплановані композиції HTML; RetryButton — нативна кнопка в Catalog. Сітка 1/2/3 колонки від 0/640/960px, gap 16px; контейнер до 960px, відступи 16/32px.
>
> — `../../design-system.md §Component inventory / Token source, App, Catalog, ProductCard, RetryButton, abridged` · [../../design-system.md](../../../design-system.md)
> Недоступне фото — локальний випадок у списку, не п’ятий стан запиту чи новий екран.
>
> — `ux-flows.md §Screen inventory, SCR-01, verbatim` · [ux-flows.md](../ux-flows.md)

Якщо зрізу недостатньо або він суперечить коду, прочитати назване джерело повністю; не вигадувати вимоги.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-02

> **Given** каталог успішно завантажено.
> **When** Учасник воркшопу переглядає картку.
> **Then** видно фото саме цього товару, його повну назву та ціну джерела з двома десятковими знаками без перерахунку, знижки чи припущеної валюти; фото має текстовий опис із назвою товару.
>
> — `spec.md §5, AC-02, verbatim` · [spec.md](../spec.md)

### AC-09

> **Given** каталог успішно завантажено, але фото одного товару не вдалося відобразити.
> **When** Учасник воркшопу переглядає картку.
> **Then** замість зламаного фото видно «Фото недоступне»; назва, ціна й решта карток залишаються доступними, загальна помилка каталогу не виникає.
>
> — `spec.md §5, AC-09, verbatim` · [spec.md](../spec.md)

## Checklist

- [x] У components/ProductCard.tsx показати product: h2 з повною назвою як текстом, price.toFixed(2) без валюти, img із alt назви.
- [x] Локальний useState та onError прибирають зламаний img і показують «Фото недоступне» без змін store.
- [x] У styles/catalog.css оформити картку за погодженими токенами: фото 160px, object-fit: contain, перенос довгих назв, без інтерактивності.
- [x] У ProductCard.test.tsx перевірити поля, ціну 0/цілу/дробову, назву з розміткою як текст, alt і fireEvent.error: назва й ціна збережені, інша картка не змінена.

## Edge cases

| Case | Behaviour |
|---|---|
| Довге слово у назві | Повний текст переноситься, не обрізається. |
| Помилка img після success | Лише локальна заміна; інші картки доступні. |

— `spec.md §5` і `sad.md §6`, негативні гілки цієї задачі, abridged · [spec](../spec.md) · [sad](../sad.md).

## Definition of Done

- [x] React Testing Library: точні назва/src/alt/ціна, HTML у назві залишається текстом; збій одного img дає локальну заміну без загальної помилки.
- [x] Виконані критерії задачі; збережені наведені обмеження та межі модулів.
- [x] `npm run build`, `npm run test -- --run`, `npm run lint` проходять на Node.js 22.12+; нових залежностей немає.
