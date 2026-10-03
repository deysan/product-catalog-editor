---
id: "T7"
title: "Перевірити сумісність пошуку зі станами завантаження"
layer: "tests"
deps: ["T6"]
blocks: ["T8"]
acs: ["AC-06", "AC-07"]
files_hint: ["src/features/catalog/components/Catalog.test.tsx"]
owner: "Автор навчального проєкту"
estimate: "0.5h"
context_budget: "M"
status: "todo"
---

# T7 — Перевірити сумісність пошуку зі станами завантаження

## Place in the sequence

- **Blocked by:** T6 — Перевірити пошук після локальної заміни товарів. **Blocks:** T8 — Зареєструвати поле та зафіксувати перевірку екрана.
- **Wave:** 6; **Lane:** Catalog.tsx/Catalog.test.tsx: T3–T7 послідовно через перекриття files_hint.

## Why (user story)

> ### US-03: Зрозуміти відсутність збігів
> **As a** Учасник воркшопу **I want** бачити повідомлення за відсутності збігів **So that** змінити запит і продовжити пошук.

— `spec.md §4, US-03, verbatim` · [spec.md](../spec.md).

Ця задача: Ізолювати store; перевірити idle/loading/error, retry із керованим fetch та успішний порожній масив; зберегти чинні перевірки retry-focus й ProductCard.

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

> ### AC-06 (US-01) — authorization
> **Given** Учасник воркшопу відкрив навчальний застосунок без входу в обліковий запис і каталог успішно завантажено.
> **When** він користується пошуком.
> **Then** пошук доступний без реєстрації, входу або додаткових дозволів. Заборона доступу N/A: у продукті немає ролей чи захищених каталогів.

— `spec.md §5, AC-06, verbatim` · [spec.md](../spec.md).
> ### AC-07 (US-03, US-05) — cross-context
> **Given** початкове завантаження очікується, завершилося помилкою або успішно повернуло порожній каталог.
> **When** Учасник воркшопу переглядає екран.
> **Then** до успіху поле пошуку не показується й повідомлення про відсутність збігів не замінює очікування або помилку з повторною спробою. Після успішного порожнього завантаження поле доступне, а за будь-якого запиту видно «Товарів немає» замість повідомлення про відсутність збігів.

— `spec.md §5, AC-07, verbatim` · [spec.md](../spec.md).

## Checklist

- [ ] Ізолювати store; перевірити idle/loading/error, retry із керованим fetch та успішний порожній масив; зберегти чинні перевірки retry-focus й ProductCard.
- [ ] Змінювати тільки: `src/features/catalog/components/Catalog.test.tsx`.
- [ ] Компонентні тести Catalog.test.tsx підтверджують приховане поле до success, error/retry/loading, aria-busy і пріоритет catalog-empty за будь-якого query.

## Edge cases

| Case | Behaviour |
|---|---|
| AC-06 | пошук доступний без реєстрації, входу або додаткових дозволів. Заборона доступу N/A: у продукті немає ролей чи захищених каталогів. |
| AC-07 | до успіху поле пошуку не показується й повідомлення про відсутність збігів не замінює очікування або помилку з повторною спробою. Після успішного порожнього завантаження поле доступне, а за будь-якого запиту видно «Товарів немає» замість повідомлення про відсутність збігів. |

— `spec.md §5, AC-06, AC-07, abridged` · [spec.md](../spec.md); `sad.md §6, runtime branches, abridged` · [sad.md](../sad.md).

## Definition of Done

- [ ] Компонентні тести Catalog.test.tsx підтверджують приховане поле до success, error/retry/loading, aria-busy і пріоритет catalog-empty за будь-якого query.
- [ ] Усі наведені обмеження збережені.
- [ ] `npm run build`, `npm run test -- --run`, `npm run lint` проходять.
