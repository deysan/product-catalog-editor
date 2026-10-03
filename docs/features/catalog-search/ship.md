# Ship — catalog-search

Date: 2026-10-03. Size: XS. Route: quick. Delivery: local-only; PR prepared.

## Summary

Локальний пошук одразу відбирає поточні товари за частиною назви. Запит без збігів показує окреме повідомлення; очищення повертає весь актуальний список. [Changelog](changelog.md), [review PASS](_review/review-2026-10-03.md).

## Acceptance criteria

- AC-01 — підрядок назви без урахування регістру, без submit, порядок збережено.
- AC-02 — крайні пробіли ігноруються; порожній запит повертає всі товари.
- AC-03 — повідомлення без збігів, доступне поле, відновлення списку без retry.
- AC-04 — незмінні каталог і snapshot; пошук не додає fetch.
- AC-05 — результати відповідають актуальним назвам і складу каталогу.
- AC-06 — доступне поле з label без входу.
- AC-07 — збережені loading/error/retry та пріоритет порожнього каталогу.

## Design

- [Spec](spec.md), [Architecture](sad.md), [UX flows](ux-flows.md), [Screens](screens.md).
- Accepted decisions: [ADR-001](../../adr/001-toolchain.md), [ADR-002](../../adr/002-catalog-module.md), [ADR-003](../../adr/003-ephemeral-state.md).
- Data model, migrations, new external API: N/A.

## Tasks (SDD-Task trailers)

- T1 — `7dd2842`: title filter.
- T2 — `ca3a43c`: responsive search styles.
- T3 — `bf38e25`: accessible local search input.
- T4 — `85d4a6e`: no matches versus empty catalog.
- T5 — `d295289`: catalog/snapshot/request invariants.
- T6 — `50b4331`: current renamed/removed products.
- T7 — `549a5c9`: loading/error/retry compatibility.
- T8 — `8a30efd`: inventory and verification.

## Verification

Final gate: Node v24.19.0; `npm run build` PASS, `npm run test -- --run` PASS (101 tests / 6 files), `npm run lint` PASS. Build includes TypeScript static checks. Separate integration runner: N/A.

Actual run: Vite at http://127.0.0.1:5173/ in Chrome against live DummyJSON, 20 product cards loaded.

- AC-01: entered `aPpLe` → only Apple (1.99) remained immediately, without submit. Live dataset contains one matching title; multi-match ordering/title-only semantics are covered by automated tests.
- AC-02: entered `  apple  ` → same Apple card; whitespace-only and empty input → all 20 original cards returned in original order.
- AC-03: entered `zzzz-no-match` → no cards, exact «За вашим запитом товарів не знайдено», field remained available, no retry; clearing restored the list.
- AC-06: used the labeled field without registration or login.

Result: verified-working for the observed runtime outcomes. AC-04 full store/snapshot/network invariants, AC-05 local product replacement, AC-07 controlled loading/error/empty states remain covered by passing automated tests; these controlled scenarios and responsive 320/1280px checks were not independently repeated in this ship run. Previous browser evidence: [verification](verification.md).

## Operational notes

Migration/config/feature flags: none. Rollback: restore the previous app build; no persistent data to migrate.

## Publication

GitHub remote: `git@github.com:deysan/product-catalog-editor.git`; feature branch: `feat/catalog-search`; PR base: `main`, explicitly selected by the author. Push and PR creation authorized by the author on 2026-10-03. Final reviewed documents, roadmap and design-system corrections are included in the delivery commit. Merge remains a human decision.

Delivery commit: `docs(catalog-search): complete local ship preparation`.

The PR uses a concise description derived from Summary, Acceptance criteria, Design, Verification and Operational notes above; this publication record is excluded from its body.
