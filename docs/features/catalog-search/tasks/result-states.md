---
id: "T4"
title: "Розрізнити відсутність збігів і порожній каталог"
layer: "ui"
deps: ["T3"]
blocks: ["T5"]
acs: ["AC-03", "AC-07"]
files_hint: ["src/features/catalog/components/Catalog.tsx", "src/features/catalog/components/Catalog.test.tsx"]
owner: "Автор навчального проєкту"
estimate: "0.5h"
context_budget: "M"
status: "todo"
---

# T4 — Розрізнити відсутність збігів і порожній каталог

## Place in the sequence

- **Blocked by:** T3 — Підключити локальний запит і видимі картки. **Blocks:** T5 — Перевірити незмінність даних і відсутність запитів.
- **Wave:** 3; **Lane:** Catalog.tsx/Catalog.test.tsx: T3–T7 послідовно через перекриття files_hint.

## Why (user story)

> ### US-03: Зрозуміти відсутність збігів
> **As a** Учасник воркшопу **I want** бачити повідомлення за відсутності збігів **So that** змінити запит і продовжити пошук.

— `spec.md §4, US-03, verbatim` · [spec.md](../spec.md).

Ця задача: Спершу перевіряти products.length, потім видимий список; у постійному statusBlock показати no-match без alert/retry, зберегти вузол поля й фокус.

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
> App: семантичний `main`, один `h1` «Каталог товарів», контейнер `.app-shell`. Catalog: область «Товари», постійний блок стану та список карток. Поле «Пошук за назвою» стоїть над результатами тільки за `status === 'success'`, включно з порожнім каталогом. Початковий текст поля порожній. Варіанти нижче — стани одного екрана, не нові сторінки чи статуси store.

— `screens.md §Screens, SCR-01, verbatim` · [screens.md](../screens.md).
**Reuse:** наявні Catalog, ProductCard, RetryButton, .catalog-list, .catalog-status; токени --space-unit, --color-surface, --color-text, --color-muted, --color-focus і base.css :focus-visible. CatalogSearchField — нова композиція label/input: inventory не містить поля; окремий React-компонент не потрібен.

> - Поле на всю доступну ширину контейнера, `min-width: 0`, `box-sizing: border-box`; відстань між label і полем 8px, після поля до результату 16px. Нативний `input type="text"` із пов’язаним видимим `label` «Пошук за назвою», висота щонайменше 44px, відступи 8px 16px, рамка 1px кольору `--color-muted`, радіус 4px. Біле тло, основний текст, успадкований шрифт. Декоративна `--color-border` лишається для карток і блоків стану; рамка поля має забезпечувати контраст щонайменше 3:1 до поверхні.

— `screens.md §Screens, SCR-01 оформлення, verbatim` · [screens.md](../screens.md).
**Стани SCR-01:** default/loading, success/all-products, success/matches, empty/no-match, empty/catalog-empty, error; photo-unavailable успадковується, validation N/A.

**Fallback:** якщо зріз недостатній чи суперечить коду, відкрити підписане джерело повністю; джерело має пріоритет. Не вигадувати вимог.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

> ### AC-03 (US-03) — error
> **Given** непорожній каталог успішно завантажено.
> **When** пошуковий запит не має жодного збігу.
> **Then** карток немає, видно «За вашим запитом товарів не знайдено». Поле залишається доступним; зміна або очищення запиту відновлює відповідний список. Це не помилка завантаження: повторна спроба не з’являється.

— `spec.md §5, AC-03, verbatim` · [spec.md](../spec.md).
> ### AC-07 (US-03, US-05) — cross-context
> **Given** початкове завантаження очікується, завершилося помилкою або успішно повернуло порожній каталог.
> **When** Учасник воркшопу переглядає екран.
> **Then** до успіху поле пошуку не показується й повідомлення про відсутність збігів не замінює очікування або помилку з повторною спробою. Після успішного порожнього завантаження поле доступне, а за будь-якого запиту видно «Товарів немає» замість повідомлення про відсутність збігів.

— `spec.md §5, AC-07, verbatim` · [spec.md](../spec.md).

## Checklist

- [ ] Спершу перевіряти products.length, потім видимий список; у постійному statusBlock показати no-match без alert/retry, зберегти вузол поля й фокус.
- [ ] Змінювати тільки: `src/features/catalog/components/Catalog.tsx`, `src/features/catalog/components/Catalog.test.tsx`.
- [ ] Компонентні тести Catalog.test.tsx перевіряють точні повідомлення, role=status, відсутність retry для no-match і відновлення списку.

## Edge cases

| Case | Behaviour |
|---|---|
| AC-03 | карток немає, видно «За вашим запитом товарів не знайдено». Поле залишається доступним; зміна або очищення запиту відновлює відповідний список. Це не помилка завантаження: повторна спроба не з’являється. |
| AC-07 | до успіху поле пошуку не показується й повідомлення про відсутність збігів не замінює очікування або помилку з повторною спробою. Після успішного порожнього завантаження поле доступне, а за будь-якого запиту видно «Товарів немає» замість повідомлення про відсутність збігів. |

— `spec.md §5, AC-03, AC-07, abridged` · [spec.md](../spec.md); `sad.md §6, runtime branches, abridged` · [sad.md](../sad.md).

## Definition of Done

- [ ] Компонентні тести Catalog.test.tsx перевіряють точні повідомлення, role=status, відсутність retry для no-match і відновлення списку.
- [ ] Усі наведені обмеження збережені.
- [ ] `npm run build`, `npm run test -- --run`, `npm run lint` проходять.
