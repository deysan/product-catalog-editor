---
status: Accepted
date: "2026-10-03"
---

# ADR-001 — Навчальний frontend toolchain

## Context

Стек заданий автором; засоби тестування й npm підтверджено під час survey. Потрібен невеликий проєкт для практики Codex і SDD.

## Decision

React + Vite + TypeScript, npm, fetch, звичайний CSS; Vitest + React Testing Library з jsdom та ESLint. TypeScript strict. CI поза першою версією. Версії залежностей фіксуємо під час майбутнього scaffold.

## Alternatives

Альтернативи: окремий server-cache інструмент або повний UI kit збільшили б навчальний обсяг; лише ручні перевірки не дають повторюваної перевірки store та UI.

## Consequences

Build, test і lint виконуватимуться локально. Зараз немає package.json або встановлених залежностей; команди в карті заплановані.

## Source

[Idea brief](../idea-brief.md) і рішення автора під час survey 2026-10-03. Це архітектурне рішення, реалізація ще не почалася.
