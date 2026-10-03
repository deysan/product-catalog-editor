---
id: "T6"
title: "Перевірити пошук після локальної заміни товарів"
layer: "tests"
deps: ["T5"]
blocks: ["T7"]
acs: ["AC-05"]
files_hint: ["src/features/catalog/components/Catalog.test.tsx"]
owner: "Автор навчального проєкту"
estimate: "0.5h"
context_budget: "M"
status: "todo"
---

# T6 — Перевірити пошук після локальної заміни товарів

## Place in the sequence

- **Blocked by:** T5 — Перевірити незмінність даних і відсутність запитів. **Blocks:** T7 — Перевірити сумісність пошуку зі станами завантаження.
- **Wave:** 5; **Lane:** Catalog.tsx/Catalog.test.tsx: T3–T7 послідовно через перекриття files_hint.

## Why (user story)

> ### US-05: Шукати у поточному каталозі
> **As a** Учасник воркшопу **I want** результати за актуальними назвами **So that** бачити відповідність поточному стану каталогу.

— `spec.md §4, US-05, verbatim` · [spec.md](../spec.md).

Ця задача: За активного query незмінно замінити products через тестовий store: перейменувати товар, прибрати товар і перейти до порожнього набору; не додавати production дій редагування або видалення.

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

> ### AC-05 (US-05) — cross-context
> **Given** каталог згодом змінено локально іншою функцією, а пошуковий запит залишається введеним.
> **When** змінюється актуальна назва чи склад каталогу.
> **Then** видимий список одразу відповідає поточним назвам і товарам, а не початковому знімку: перейменований товар перевіряється за новою назвою, відсутній у каталозі товар не показується. Критерій не додає дій редагування чи видалення в цей крок.

— `spec.md §5, AC-05, verbatim` · [spec.md](../spec.md).

## Checklist

- [ ] За активного query незмінно замінити products через тестовий store: перейменувати товар, прибрати товар і перейти до порожнього набору; не додавати production дій редагування або видалення.
- [ ] Змінювати тільки: `src/features/catalog/components/Catalog.test.tsx`.
- [ ] Компонентний тест Catalog.test.tsx із заміною store.products в act підтверджує актуальні назви, видалені товари, збереження query і незмінний знімок.

## Edge cases

| Case | Behaviour |
|---|---|
| AC-05 | видимий список одразу відповідає поточним назвам і товарам, а не початковому знімку: перейменований товар перевіряється за новою назвою, відсутній у каталозі товар не показується. Критерій не додає дій редагування чи видалення в цей крок. |

— `spec.md §5, AC-05, abridged` · [spec.md](../spec.md); `sad.md §6, runtime branches, abridged` · [sad.md](../sad.md).

## Definition of Done

- [ ] Компонентний тест Catalog.test.tsx із заміною store.products в act підтверджує актуальні назви, видалені товари, збереження query і незмінний знімок.
- [ ] Усі наведені обмеження збережені.
- [ ] `npm run build`, `npm run test -- --run`, `npm run lint` проходять.
