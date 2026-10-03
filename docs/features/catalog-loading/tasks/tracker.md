# Tracker — catalog-loading

Стани: `todo` · `in_progress` · `blocked` · `review` · `done`. Реалізація виконується послідовно, TDD.

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T1 | [Отримати й перевірити весь набір товарів](fetch-and-validate.md) | infra | Автор навчального проєкту | 2–4h | — | done |
| T2 | [Керувати завантаженням і знімком у Zustand](catalog-store.md) | app | Автор навчального проєкту | 2–4h | T1 | done |
| T3 | [Показати картку та заміну недоступного фото](product-card.md) | ui | Автор навчального проєкту | 2–4h | T2 | todo |
| T4 | [Зібрати екран каталогу зі станами та ручним retry](catalog-screen.md) | ui | Автор навчального проєкту | 2–4h | T3 | todo |

**Total:** 4 задачі; орієнтовно 8–16 годин, без зобов’язання строків.

## Verification

- T1: RED підтверджено; 32 тести, build і lint пройшли.
- T2: RED підтверджено; 40 тестів, build і lint пройшли.
