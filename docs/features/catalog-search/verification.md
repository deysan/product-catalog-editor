# Verification — catalog-search

Дата: 2026-10-03. Size **XS**, route **quick**. Реалізація T1–T8 завершена; незалежний review ще попереду.

## Execution

Sequential single-agent; TDD on; parallel 1. Settings: team_mode false, workflow_mode auto, isolation worktree, max_parallel_agents 3, require_integration auto, auto_commit per_task. Workflow недоступний: fallback до послідовного виконання в поточній feat/catalog-search. DAG: 8 задач, 7 фаз, найдовший ланцюг 7, ширина 2. T2 закрито після T3 відповідно до вимоги браузерної перевірки.

Detected gates: `npm run test -- --run`, `npm run lint`, `npm run build` (TypeScript strict і production build). Integration **NON-red**: окремого runner немає, Docker daemon недоступний; за inline Test plan dependency N/A. Компонентні тести використовують реальний Zustand та підмінений fetch.

## TDD and per-task gates

| Task | RED / proving evidence | GREEN gate | Commit |
|---|---|---|---|
| T1 | BAD red: відсутній import ./search; після заглушки контракту GOOD red: Not implemented, 35 тестів падають | 93 tests; build/lint pass | 7dd2842 |
| T3 | GOOD red: Unable to find role textbox and name «Пошук за назвою» | 94 tests; build/lint pass | bf38e25 |
| T2 | Browser RED: поле 21.5px, label поруч; GREEN: 44px, label над полем, видимий focus | 94 tests; build/lint pass; 320/1280px pass | ca3a43c |
| T4 | GOOD red: no-match не має role=status | 98 tests; build/lint pass | 85d4a6e |
| T5 | Початково green для вже реалізованої поведінки; контрольний зайвий fetch дає 2 замість 1, мутація price дає 999 замість 12.5 | 99 tests; build/lint pass | d295289 |
| T6 | Початково green; контрольний пошук зі знімка дає Apple Juice/Pineapple замість Pineapple/Apple Milk | 100 tests; build/lint pass | 50b4331 |
| T7 | Початково green; контрольний показ поля під час loading порушує not.toBeInTheDocument | 101 tests; build/lint pass | 549a5c9 |
| T8 | Document RED: verification.md is missing; inventory не містить CatalogSearchField | 101 tests; build/lint pass; browser pass | task-scoped commit з SDD-Task: T8 |

T5–T7 — задачі регресійних тестів, а не нової production-поведінки. Контрольні дефекти тимчасові; оригінальний код відновлено перед кожним GREEN/gate. Тести не послаблювалися. Для T3 оновлено застарілу заборону textbox у smoke-тесті App згідно з новим AC-07.

## AC coverage

- AC-01/02: search.test.ts — підрядок лише title, регістр, trim, порожній запит, буквальні символи/розмітка/лапки, внутрішні пробіли, відсутність приблизних збігів, порядок, 0–20 товарів. Catalog.test.tsx — введення без submit та очищення.
- AC-03: точний no-match status, відсутність list/retry/alert, відновлення збігів і всього списку, незмінний вузол поля та фокус.
- AC-04: після кожної пошукової дії повне порівняння products/initialProducts, їхніх посилань і лічильника fetch; незалежні копії початкових значень.
- AC-05: поточні назви змінюються у збіг і зі збігу, видалення останнього збігу й порожній каталог; query, focus і знімок збережені.
- AC-06/07: поле доступне без авторизації лише за success, у тому числі за порожнього каталогу; loading/error/retry і aria-busy збережені. Catalog-empty має пріоритет за порожнього, пробільного й непорожнього запиту.

## Browser verification — SCR-01

Chrome, viewport 320×800 та 1280×800 CSS px. Перевірено реальний застосунок з DummyJSON і тимчасову локальну QA-сторінку з підміною fetch для детермінованих loading, empty, error/retry та трьох товарів. Фікстури: Apple Juice, Pineapple, Milk із довгим нерозривним суфіксом, недоступні фото. Тимчасові QA-файли видалено; у production їх немає.

| State / interaction | 320px | 1280px |
|---|---|---|
| WF-01 default/loading: текст очікування, пошук/retry приховані; aria-busy=true | pass | pass |
| WF-02 all-products: порядок, повні назви, ціни; нерозривна назва переноситься | pass | pass |
| WF-03 matches: aPpLe / крайні пробіли → Apple Juice, Pineapple без Enter | pass | pass |
| WF-04 no-match: точне повідомлення, без retry; поле й focus збережені | pass | pass |
| WF-05 catalog-empty: «Товарів немає» до й після apple, поле доступне | pass | pass |
| WF-06 error/retry: повідомлення й кнопка, пошук прихований; після retry success і focus на постійному status block | pass | pass |
| WF-07 photo-unavailable: заглушка, назви й ціни збережені, пошук працює | pass | pass |
| Tab у поле → введення → no-match → Cmd+A/Backspace → усі картки → Tab із поля | pass | pass |

Поле: висота 44px на обох ширинах, ширина 288/896px відповідно, контур `rgb(29, 78, 216) solid 3px` не обрізаний. `document.documentElement.scrollWidth` дорівнює viewport 320/1280 у перевірених станах; горизонтального прокручування немає. No-match переноситься на вузькому екрані. Focus не губиться під час зміни результатів/очищення; після Tab виходить із поля. Тимчасовий viewport override скинуто.

Окремий кадр loading під час швидкого browser retry не зафіксовано: цей перехід, aria-busy та focus перевірено компонентним тестом із керованою відповіддю. Початковий loading в браузері перевірено окремо.

## Review handoff

Усі T1–T8 done; blocked/dropped немає. Кожен implementation commit має SDD-Task і SDD-AC trailers. Підготовчі документи функції та раніше змінений docs/roadmap.md залишено поза task-scoped комітами. Переглянути committed diff та tasks/tracker.md, далі `/clear` → `/sdd:review catalog-search`; після незалежного review — `/sdd:ship catalog-search`.
