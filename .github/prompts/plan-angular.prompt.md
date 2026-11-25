---
description: Create a gated Angular modernization plan from the reviewed assessment.
---

Use `assessment/angular-assessment.md` and the Angular workshop guardrails as
the source of truth. Propose a dependency-ordered plan for
`app/angular-order-service`: security triage, Angular 20 → 21 → 22, compatible
Node and TypeScript, the application builder, standalone components, control
flow and appropriately scoped signals. Preserve the order API simulator and
user-visible behavior.

For each task include scope, dependencies, risks, commands, observable
acceptance criteria and test/build gates. Mark the Karma-to-Vitest migration as
optional and experimental. Do not implement the plan.
