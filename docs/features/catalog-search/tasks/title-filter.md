---
id: "T1"
title: "Реалізувати чистий пошук підрядка назви"
layer: "domain"
deps: []
blocks: ["T3"]
acs: ["AC-01", "AC-02", "AC-04"]
files_hint: ["src/features/catalog/model/search.ts", "src/features/catalog/model/search.test.ts"]
owner: "Автор навчального проєкту"
estimate: "0.5h"
context_budget: "M"
status: "todo"
---

# T1 — Реалізувати чистий пошук підрядка назви

## Place in the sequence

- **Blocked by:** —. **Blocks:** T3 — Підключити локальний запит і видимі картки.
- **Wave:** 1; **Lane:** Окрема гілка; T1 і T2 стартують незалежно.

## Why (user story)

> ### US-01: Знайти товар за назвою
> **As a** Учасник воркшопу **I want** вводити частину назви **So that** бачити лише відповідні товари.

— `spec.md §4, US-01, verbatim` · [spec.md](../spec.md).

Ця задача: Створити filterProductsByTitle(products, query): trim().toLowerCase(), title.toLowerCase().includes(); порожній запит повертає весь поточний набір без мутації.

## Inlined context

> Обраний підхід — локальний пошук підрядка назви без урахування регістру та крайніх пробілів запиту. Порожній запит повертає весь поточний каталог; відсутність збігів має зрозуміле повідомлення. Пошук змінює тільки видимий список.

— `spec.md §1, підхід, verbatim` · [spec.md](../spec.md).
> Розширюємо наявний модуль catalog: UI читає поточні products і статус із store та викликає чисту model-функцію. Пошук не викликає loadProducts або API. Store і API не змінюють контракт. Обчислення виконується на кожному рендері з актуальними products/query, без дубльованого стану та effect для синхронізації.

— `sad.md §5, catalog boundary, verbatim` · [sad.md](../sad.md).
> Для локального правила достатньо одного SPA-учасника та самовикликів: додатковий сервіс був би вигаданим. За idle/loading/error поля немає; чинні повідомлення й retry зберігаються. AC-05: коли інша функція незмінно замінить products, підписка Zustand спричинить рендер і те саме обчислення з чинним query. UI редагування/видалення тут не додаємо.

— `sad.md §6, runtime branches, verbatim` · [sad.md](../sad.md).
> | Мережа | 0 додаткових звернень через пошук | Лічильник підміненого fetch до й після пошукових дій |
> | Цілісність | 0 змін каталогу та початкового знімка | Порівняння всіх полів і порядку до й після пошуку |

— `spec.md §6, мережа й цілісність, abridged` · [spec.md](../spec.md).
> | Майбутня функція мутує products на місці або зберігає копію результатів | Low | Незмінні оновлення store і обчислення з актуального products/query; перевірка AC-05 через заміну масиву | Автор навчального проєкту |

— `sad.md §11, ризик актуальності, verbatim` · [sad.md](../sad.md).
> React + Vite + TypeScript, npm, fetch, звичайний CSS; Vitest + React Testing Library з jsdom та ESLint. TypeScript strict. CI поза першою версією. Версії залежностей фіксуємо під час майбутнього scaffold.

— `001-toolchain.md §Decision, Accepted decision, verbatim` · [001-toolchain.md](../../../adr/001-toolchain.md).
> src/features/catalog із api, model, components; src/App.tsx складає один екран, src/styles містить звичайний CSS. Прямі залежності UI → model → api; API не залежить від UI/store.

— `002-catalog-module.md §Decision, Accepted decision, verbatim` · [002-catalog-module.md](../../../adr/002-catalog-module.md).
> Zustand тримає поточні товари, незмінний початковий знімок, статус і помилку. useState тримає незбережені поля форми. Лише GET через fetch, без постійного сховища.

— `003-ephemeral-state.md §Decision, Accepted decision, verbatim` · [003-ephemeral-state.md](../../../adr/003-ephemeral-state.md).
**Fallback:** якщо зріз недостатній чи суперечить коду, відкрити підписане джерело повністю; джерело має пріоритет. Не вигадувати вимог.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

> ### AC-01 (US-01) — happy
> **Given** каталог успішно завантажено й містить «Apple Juice», «Pineapple» та «Milk».
> **When** Учасник воркшопу вводить «aPpLe» у поле «Пошук за назвою».
> **Then** без окремого підтвердження видно картки «Apple Juice» та «Pineapple» в порядку каталогу; «Milk» приховано. Пошук перевіряє тільки назву, а не ціну чи інші поля.

— `spec.md §5, AC-01, verbatim` · [spec.md](../spec.md).
> ### AC-02 (US-01, US-02) — happy
> **Given** каталог успішно завантажено.
> **When** Учасник воркшопу вводить «  apple  », очищає поле або вводить лише пробіли.
> **Then** крайні пробіли ігноруються: перший запит рівнозначний «apple», два останні показують усі поточні товари. Внутрішні пробіли та інші символи порівнюються буквально; приблизних збігів немає.

— `spec.md §5, AC-02, verbatim` · [spec.md](../spec.md).
> ### AC-04 (US-04) — domain invariant
> **Given** каталог і початковий знімок уже завантажено.
> **When** Учасник воркшопу вводить, змінює та очищає запит, зокрема отримує нуль збігів.
> **Then** кількість, порядок та всі поля товарів у каталозі й початковому знімку залишаються незмінними; очищення повертає весь поточний каталог. Жодна пошукова дія не звертається до зовнішнього джерела.

— `spec.md §5, AC-04, verbatim` · [spec.md](../spec.md).

## Checklist

- [ ] Створити filterProductsByTitle(products, query): trim().toLowerCase(), title.toLowerCase().includes(); порожній запит повертає весь поточний набір без мутації.
- [ ] Змінювати тільки: `src/features/catalog/model/search.ts`, `src/features/catalog/model/search.test.ts`.
- [ ] Unit-тести search.test.ts перевіряють регістр, пробіли, буквальні символи, порядок, 0–20 товарів і незмінність вхідних даних.

## Edge cases

| Case | Behaviour |
|---|---|
| AC-01 | без окремого підтвердження видно картки «Apple Juice» та «Pineapple» в порядку каталогу; «Milk» приховано. Пошук перевіряє тільки назву, а не ціну чи інші поля. |
| AC-02 | крайні пробіли ігноруються: перший запит рівнозначний «apple», два останні показують усі поточні товари. Внутрішні пробіли та інші символи порівнюються буквально; приблизних збігів немає. |
| AC-04 | кількість, порядок та всі поля товарів у каталозі й початковому знімку залишаються незмінними; очищення повертає весь поточний каталог. Жодна пошукова дія не звертається до зовнішнього джерела. |

— `spec.md §5, AC-01, AC-02, AC-04, abridged` · [spec.md](../spec.md); `sad.md §6, runtime branches, abridged` · [sad.md](../sad.md).

## Definition of Done

- [ ] Unit-тести search.test.ts перевіряють регістр, пробіли, буквальні символи, порядок, 0–20 товарів і незмінність вхідних даних.
- [ ] Усі наведені обмеження збережені.
- [ ] `npm run build`, `npm run test -- --run`, `npm run lint` проходять.
