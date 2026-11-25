---
applyTo: "app/angular-order-service/**"
---

# Angular Order Service guardrails

- Treat this directory as a workshop starter: do not modernize it unless the
  current task explicitly requests a migration.
- Preserve the Contoso order behavior, seeded records and simulated
  `/api/orders` contract; the interceptor is not a network server.
- Keep user-facing errors explicit, forms accessible and order/status types
  checked. Never present the in-memory data store as production persistence.
- Follow Angular's supported one-major-at-a-time upgrade path and check the
  Node.js, TypeScript and RxJS compatibility table before changing versions.
- Run the existing tests and production build after each migration stage.
  Record failures and dependency advisories rather than using `--force` or
  claiming an advisory is exploitable without evidence.
- Do not modify the Java workshop or add a backend to this Angular exercise.
