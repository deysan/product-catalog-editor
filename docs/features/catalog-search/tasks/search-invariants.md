---
id: "T5"
title: "Перевірити незмінність даних і відсутність запитів"
layer: "tests"
deps: ["T4"]
blocks: ["T6"]
acs: ["AC-04"]
files_hint: ["src/features/catalog/components/Catalog.test.tsx"]
owner: "Автор навчального проєкту"
estimate: "0.5h"
context_budget: "M"
status: "todo"
---

# T5 — Перевірити незмінність даних і відсутність запитів

## Place in the sequence

- **Blocked by:** T4 — Розрізнити відсутність збігів і порожній каталог. **Blocks:** T6 — Перевірити пошук після локальної заміни товарів.
- **Wave:** 4; **Lane:** Catalog.tsx/Catalog.test.tsx: T3–T7 послідовно через перекриття files_hint.

## Why (user story)

> ### US-04: Зберегти товари під час пошуку
> **As a** Учасник воркшопу **I want** шукати локально без зміни даних **So that** не втратити товари й початковий знімок.

— `spec.md §4, US-04, verbatim` · [spec.md](../spec.md).

Ця задача: Підмінити fetch, дочекатися початкового успіху, зняти копії обох масивів і число викликів; ввести/змінити/очистити query, включно з нульовим результатом, та порівняти.

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

> ### AC-04 (US-04) — domain invariant
> **Given** каталог і початковий знімок уже завантажено.
> **When** Учасник воркшопу вводить, змінює та очищає запит, зокрема отримує нуль збігів.
> **Then** кількість, порядок та всі поля товарів у каталозі й початковому знімку залишаються незмінними; очищення повертає весь поточний каталог. Жодна пошукова дія не звертається до зовнішнього джерела.

— `spec.md §5, AC-04, verbatim` · [spec.md](../spec.md).

## Checklist

- [ ] Підмінити fetch, дочекатися початкового успіху, зняти копії обох масивів і число викликів; ввести/змінити/очистити query, включно з нульовим результатом, та порівняти.
- [ ] Змінювати тільки: `src/features/catalog/components/Catalog.test.tsx`.
- [ ] Компонентний тест Catalog.test.tsx порівнює всі поля, кількість і порядок products/initialProducts та лічильник fetch до і після серії пошукових дій.

## Edge cases

| Case | Behaviour |
|---|---|
| AC-04 | кількість, порядок та всі поля товарів у каталозі й початковому знімку залишаються незмінними; очищення повертає весь поточний каталог. Жодна пошукова дія не звертається до зовнішнього джерела. |

— `spec.md §5, AC-04, abridged` · [spec.md](../spec.md); `sad.md §6, runtime branches, abridged` · [sad.md](../sad.md).

## Definition of Done

- [ ] Компонентний тест Catalog.test.tsx порівнює всі поля, кількість і порядок products/initialProducts та лічильник fetch до і після серії пошукових дій.
- [ ] Усі наведені обмеження збережені.
- [ ] `npm run build`, `npm run test -- --run`, `npm run lint` проходять.
