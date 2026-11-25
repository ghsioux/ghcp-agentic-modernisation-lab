# Angular Order Service workshop starter

This is the intentionally **legacy starting point** for the
[Angular and TypeScript modernization workshop](../../docs/angular/workshop.md).
It is a small Contoso order workspace, not a production application.

The starter uses Angular/CLI 20.3.15, TypeScript 5.9, RxJS 7, NgModules,
`HttpClientModule`, `*ngIf`/`*ngFor`, the webpack-based browser builder and
Karma/Jasmine. Angular 20 leaves support on November 28, 2026; use this
version only in an isolated workshop environment. See the current
[Angular release schedule](https://angular.dev/reference/releases).

## Prerequisites and run

Use Node.js **22.22.3 or later within Node 22**, or **24.15.0 or later within
Node 24**, plus npm and Chrome/Chromium. Both Node lines are compatible with
the starter and the Angular 21 and 22 migration targets. `.nvmrc` selects
Node 24.15.0 for version managers that support it. Verify the actual installed
version rather than assuming an existing Codespace has a sufficiently recent
Node 22 patch.

From this directory:

```bash
node --version
npm ci
npm test
npm run build
npm start
```

Open <http://127.0.0.1:4200>. If Chrome is not detected, set `CHROME_BIN`
to your Chrome or Chromium executable before `npm test`. The test command runs
Karma once in ChromeHeadless. In environments that require a package-feed
wrapper, use that organization's approved wrapper for npm commands; for
example, GitHub workstations use `gh cfs -- npm ci`. The lockfile omits
registry-specific tarball URLs, so the configured registry supplies packages.

## Scenario and behavior

The workspace starts with the same three orders as the Java sample:

| ID | Customer | Amount | Status |
| --- | --- | --- | --- |
| 1 | alice | $120.50 | PENDING |
| 2 | alice | $80.00 | PROCESSING |
| 3 | bob | $42.99 | COMPLETED |

It supports the order list, summary metrics, customer or exact-ID search,
status filtering, date/amount sorting, creation with validation, status
updates, customer-total lookup, and refresh. The initial total is $243.49,
two orders are active, and Alice's total is $200.50. New orders start
`PENDING`; customer names must not be blank and amounts must be at least
`0.01`. Customer-total lookup is case-sensitive, like the Java repository.

## Simulated API, not a server

`OrdersApi` uses Angular `HttpClient`. A dependency-injected interceptor
implements these requests **inside the browser**, backed by `OrderStore`:

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/{id}` | Return one order or 404 |
| GET | `/api/orders/customer/{customer}/total` | Sum exact customer matches |
| POST | `/api/orders` | Validate and create a pending order; return 201 |
| PATCH | `/api/orders/{id}/status?status=...` | Update status or return 400/404 |

These are simulated HTTP interactions, **not network endpoints**: `curl` cannot
reach them. State is local to the running page and resets on a full browser
reload. There is no backend, authentication, durable storage, or production
security. Amounts use JavaScript `number`, not the original backend's exact
decimal arithmetic, so fractional totals can exhibit floating-point rounding.
These limitations keep the exercise self-contained and are assessment topics,
not production recommendations.

## Where to look

| Path | Purpose |
| --- | --- |
| `angular.json`, `package.json`, `tsconfig*.json` | Legacy build, dependency, compiler and test configuration |
| `src/app/app.module.ts`, `src/main.ts` | NgModule-based bootstrapping and interceptor registration |
| `src/app/order.ts`, `order-store.service.ts` | Order model, seed data and business rules |
| `src/app/orders-api.service.ts`, `mock-orders.interceptor.ts` | HTTP client and in-memory API simulation |
| `src/app/app.component.*`, `order-view.ts` | Workspace, filters, metrics and interactions |
| `src/app/*.spec.ts` | Contract, view-model and component regression tests |

Do not upgrade the starter before recording the Level 1 baseline. The workshop
guides you through Angular 20 → 21 → 22 and deliberately leaves the
modernization for participants to perform.
