---
published: false
type: workshop
title: "Modernize an Angular and TypeScript application with GitHub Copilot"
short_title: "Copilot App & CLI - Angular Modernization"
description: "Assess, plan, modernize, and review a legacy Angular order application with GitHub Copilot agents."
authors:
  - Philippe DIDIERGEORGES
  - Nabil ABBAR
contacts:
  - "@Philess"
  - "@ABBARNABIL"
duration_minutes: 120
level: intermediate
tags: "Copilot, Modernization, Angular, TypeScript"
---

# Modernize an Angular and TypeScript application with GitHub Copilot

This workshop adapts the [Java and Spring Boot workshop](https://github.com/ghsioux/ghcp-agentic-modernisation-lab/blob/main/docs/workshop.md) to
Angular and TypeScript. It keeps the Contoso Order Service scenario and the
same assessment → plan → execution → review learning path. The Java workshop
and application remain separate.

You will assess an intentionally legacy Angular application, customize Copilot
for the task, plan a supported migration, carry it out and independently review
the result. You can use either **GitHub Copilot App** or **GitHub Copilot CLI**;
the actual code changes and acceptance criteria are the same.

> **The starter is intentionally old.** It is for an isolated learning
> environment, not production. Angular 20 reaches the end of support on
> November 28, 2026. Consult the current
> [Angular release schedule](https://angular.dev/reference/releases) and
> [version compatibility table](https://angular.dev/reference/versions)
> before applying this approach elsewhere.

> **There is no backend in this exercise.** The app's Angular HTTP interceptor
> simulates the original `/api/orders` contract inside the browser. The state
> resets on a full page reload and cannot be queried with `curl`. You will
> preserve this simulated contract rather than build a new service. Amounts
> use JavaScript numbers rather than the original backend's exact decimal
> arithmetic, so assess floating-point precision as a known limitation.

## What you'll learn

- Discover relevant Copilot agents, instructions, prompts, plugins and skills.
- Establish and verify a baseline before changing dependencies.
- Assess architecture, functionality, compatibility, security and migration risk.
- Create scoped guardrails and a reviewable, dependency-ordered migration plan.
- Modernize one Angular major at a time and verify behavior after every stage.
- Use Copilot code review and human judgment to triage actionable feedback.
- Communicate the outcome and remaining risks.

## Prerequisites

- A GitHub account, Git, a Copilot-enabled account and access to either
  [GitHub Copilot App](https://github.com/features/copilot/copilot-app) or
  [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli).
  Feature, model and plugin availability depend on your account and policies.
- Node.js **22.22.3 or later within Node 22**, or **24.15.0 or later within
  Node 24**, plus npm and Chrome/Chromium. These Node versions are common to
  the starter and both target majors. `.nvmrc` selects Node 24.15.0.
- A terminal and a code editor. A fresh Codespace using the repository
  configuration is an option; check `node --version` because an existing
  Codespace may have an older Node 22 patch.
- Permission to use your organization's configured npm package feed.

The starter pins Angular/CLI **20.3.15**, TypeScript **5.9.3** and RxJS 7.
The exercise target is Angular **22** via Angular **21**, using TypeScript
**6.0** for Angular 22. Angular updates must be applied one major at a time.
Do not silently substitute a newer Angular major: inspect the official
[update guide](https://angular.dev/update-guide) if the supported target or
your organization's requirements have changed.

Commands below use npm and npx directly. Where your organization requires a
package-feed wrapper, prepend it to **every** npm/npx command, including
updates; for example, on GitHub workstations use `gh cfs -- npm ci` and
`gh cfs -- npx ng ...`. Follow your organization's CI feed setup separately.

## Setup

1. Fork the repository and clone your fork. Make sure your fork includes the
   branch containing this Angular workshop; if it has since been merged, use
   the branch containing the merged files instead.
2. Switch to that branch and create your own working branch:

   ```bash
   git switch <branch-containing-angular-workshop>
   git switch -c workshop/angular-modernization
   ```

3. Open the repository root in Copilot App or launch `copilot` there. Review
   the repository before granting a plugin or agent permission to run commands.
4. Open `app/angular-order-service/README.md` in your checkout.
   Keep the root open in Copilot so it can also see `.github/agents`,
   `.github/instructions` and `.github/prompts`.

The workshop is also a standalone Markdown document and can be read directly
on GitHub or in an editor. The existing MOAW preview command is
`npx moaw serve docs/angular`, but the repository's locked MOAW CLI currently
fails to start on Node 24 because its Copilot SDK cannot resolve
`vscode-jsonrpc/node`. Until that upstream dependency issue is resolved, use
the Markdown view. Paths to repository files in this guide refer to your
checkout, not files served by the MOAW preview. Java-specific screenshots from
the original workshop are intentionally not reused here.

---

# Level 1 — Discover, assess, and plan

## Step 1: Discover the available modernization tools

Explore [Awesome Copilot](https://awesome-copilot.github.com/) and the
[GitHub Copilot modernization plugin](https://github.com/microsoft/github-copilot-modernization/tree/main/plugins/github-copilot-modernization).
Find out which workflows and languages the plugin actually supports.

The plugin documents JavaScript/TypeScript **assessment**. Its automated
planning and execution workflows are documented for **Java and .NET**, not
Angular. Do not select its Java orchestrator as an Angular migration executor.
This workshop uses ordinary Copilot guidance and the repository's
`angular-assessment` custom agent to perform the Angular-specific work. The
plugin's JavaScript/TypeScript assessment is optional and its availability and
output may change; compare its findings with your own evidence if you use it.

**Copilot App:** browse the plugin catalog and inspect a plugin's details and
permissions before enabling it. For the primary assessment, select the
repository's `angular-assessment` agent if custom agents are available.

**Copilot CLI:** inspect the same catalog; use `/agent` to select
`angular-assessment`. Installing a plugin is not required for the primary path.

If custom agents are unavailable, open
`.github/agents/angular-assessment.agent.md` and give its instructions and the
assessment prompt below to ordinary Copilot Chat.

**Expected outcome:** you can explain the distinction between an assessment
tool, a custom agent and an automatically supported migration workflow.

## Step 2: Run the application and establish a baseline

In a terminal, from the repository root:

```bash
cd app/angular-order-service
node --version
npm ci
npm test
npm run build
npm start
```

Open <http://127.0.0.1:4200>. Set `CHROME_BIN` if Chrome/Chromium is not
detected by the test runner. Stop the development server with `Ctrl+C` when
you are done. If an install fails because your feed lacks a package, record the
missing package and ask your feed administrator rather than changing the
registry or forcing an incompatible version.

Exercise the following behavior and record your observations:

| Check | Expected baseline |
| --- | --- |
| Seed | `alice` has $120.50 pending and $80.00 processing; `bob` has $42.99 completed |
| Summary | 3 orders, 2 active, $243.49 total, $81.16 average |
| Customer total | `alice` returns $200.50; names are matched case-sensitively |
| Search, filter, sort | Find by customer or exact ID, filter by status and change sort order |
| Create and update | A valid new order starts pending; blank customer/invalid amount is rejected; status can change |
| Refresh and reload | Refresh retains the in-page store; a full browser reload restores the seed |

Save command versions, test/build results, key behavior and any warnings in
your notes. The tests under `src/app/*.spec.ts` also protect the simulated
HTTP status codes and domain rules.

**Expected outcome:** a working Angular 20 application, a reproducible baseline
and an understanding that the API is simulated.

## Step 3: Check AI readiness

Ask Copilot:

```text
Read the Angular starter's README, package.json, angular.json, tsconfig files,
source and tests. Evaluate whether this repository has enough context and
verification instructions for an agent to safely modernize it. Identify
specific missing context, unsafe assumptions, and the smallest improvements.
Do not edit application code or upgrade dependencies.
```

Inspect the answer against the repository. The scoped instruction file,
custom agent and prompts are starting points, not proof the project is
ready. If your environment supports it, you can optionally inspect the
[AI-Ready plugin](https://awesome-copilot.github.com/plugin/ai-ready/) and
compare its assessment. Review its permissions before installation.

**Expected outcome:** a short list of verified readiness gaps, or an explicit
statement that a suggested gap was already covered.

## Step 4: Run an assessment

Select `angular-assessment`, or use ordinary Chat with the contents of
`.github/agents/angular-assessment.agent.md`. Ask:

```text
Assess app/angular-order-service for modernization. Read its code, tests,
configuration, README and my baseline notes. Compare the observed Angular,
Node, TypeScript, RxJS, build and test versions with current official Angular
support and compatibility guidance. Identify architecture, business behavior,
API simulation, deprecated patterns, security advisories, migration risks,
missing evidence and a feasible Angular 20 → 21 → 22 target.

Write assessment/angular-assessment.md with evidence links and proposed
priorities. Do not modify the application or execute an upgrade.
```

The reusable equivalent is `.github/prompts/assess-angular.prompt.md`.
Prompt files may be invoked by supported IDEs; in Copilot App or CLI, open the
file and copy its contents into the conversation if prompt-file invocation is
not available.

The agent may suggest `npm audit`; it queries your configured package
registry and can report vulnerabilities in development tooling as well as
runtime dependencies. Record the command, feed and result. Do not claim a CVE
is exploitable or fixed without relevant evidence, and do not run
`npm audit fix --force` as an assessment shortcut.

**Expected outcome:** a report describing the current state, supported target,
risks, unknowns and evidence; no code has been upgraded.

## Step 5: Validate and refine the assessment

Independently check the report:

1. Compare package versions with `package.json` and the lockfile.
2. Check [Angular releases](https://angular.dev/reference/releases),
   [version compatibility](https://angular.dev/reference/versions) and the
   [update guide](https://angular.dev/update-guide).
3. Trace an order from `OrdersApi` through the interceptor to the in-memory
   store. Verify that no network backend or durable database is implied.
4. Verify reported test results and distinguish observed advisories from
   unsupported security claims.
5. Mark each finding accepted, rejected with evidence, or requiring more
   investigation. Update `assessment/angular-assessment.md`.

**Expected outcome:** a reviewed assessment you can safely use for planning.

## Step 6: Generate and review a plan

Ask Copilot:

```text
Using assessment/angular-assessment.md, propose a dependency-ordered plan
for app/angular-order-service. Cover security triage, Angular 20 → 21 → 22,
compatible Node and TypeScript, the application builder, standalone bootstrap,
control-flow templates, useful signals and strict type checking. Preserve the
simulated order API and visible behavior.

Write .github/modernize/angular/plan.md and a companion tasks.json. For each
task include an ID, prerequisites, scope, commands, risks, acceptance criteria,
and test/build gates. Mark the Karma-to-Vitest migration as optional and
experimental. Do not execute the plan.
```

This plan and task graph are **your Copilot-generated artifacts**, not an
Angular plan produced by the Java/.NET modernization orchestrator. Use a
simple JSON array of task objects with stable IDs and `dependsOn` arrays; check
that it parses with `node -e "JSON.parse(require('fs').readFileSync('.github/modernize/angular/tasks.json','utf8'))"`.
Review the ordering and resolve ambiguities before approving it. A corresponding
reusable prompt is
`.github/prompts/plan-angular.prompt.md`.

**Suggested acceptance gates:**

1. Baseline tests and build pass before changes.
2. Upgrade to Angular 21, review migrations, and pass tests/build.
3. Upgrade to Angular 22 and TypeScript 6.0, review migrations, and pass
   tests/build.
4. Migrate to the application builder, standalone bootstrapping and control
   flow; introduce signals for suitable local/derived state and tighten
   TypeScript/template checks. Preserve HTTP registration and all tests.
5. Independently validate the original scenario, run checks, inspect the diff
   and document unresolved warnings.

The application builder may be offered during `ng update`; accepting it
earlier is fine if you validate that stage. Angular's
[Karma-to-Vitest migration](https://angular.dev/guide/testing/migrating-to-vitest)
for existing projects is experimental, so keep Karma/Jasmine for the
required path unless you explicitly choose the bonus.

**Expected outcome:** an approved, reviewable plan with prerequisites and
observable gates, not just a list of package versions.

---

# Level 2 — Customize and guide the agents

## Step 1: Find plugins, skills, agents and instructions

Review these repository files:

| Customization | Purpose |
| --- | --- |
| `.github/instructions/angular-workshop.instructions.md` | Scope guardrails to the starter |
| `.github/agents/angular-assessment.agent.md` | Assess without silently upgrading |
| `.github/prompts/assess-angular.prompt.md` | Request an evidence-based report |
| `.github/prompts/plan-angular.prompt.md` | Request a gated migration plan |
| `.github/prompts/implement-angular.prompt.md` | Execute an approved plan and report failures |

Use the [Awesome Copilot catalog](https://awesome-copilot.github.com/) to find
one relevant Angular or TypeScript customization. Inspect what it does,
what tools it can use and whether its instructions conflict with this
workshop before installing or applying it. Installing a catalog plugin is
optional; the checked-in files and ordinary Chat are sufficient.

Ask Copilot:

```text
Review the Angular-specific agent, instructions and prompts in .github.
Explain when each is applied, which tools or permissions it needs, and how
I can use the prompts from my current Copilot client. Identify conflicting
or overly broad guidance; do not modify the Java workshop.
```

**Expected outcome:** you can distinguish always/scoped instructions, a
user-selected agent, a reusable prompt and an installed plugin or skill.

## Step 2: Prepare the project for AI

Revisit the readiness findings from Level 1. If your client supports the
optional AI-Ready plugin, compare its recommendations with your own; otherwise
use ordinary Copilot Chat. Compare
`.github/instructions/angular-workshop.instructions.md` with the accepted
assessment. Add only missing project-specific guidance. Preserve
the scoped `applyTo` and explicitly protect seed data, order behavior, the
HTTP simulator, accessibility, testing, compatible versions and the Java
workshop. Do not use blanket instructions that silently approve commands.

Ask Copilot to explain how its proposed rule affects a concrete migration
task, and inspect the diff. If a generated instruction is generic or
contradicts your plan, reject or narrow it.

**Expected outcome:** actionable, scoped guardrails and a recorded review
decision.

## Step 3: Find useful skills and refine the agent and prompts

Search the catalog for an Angular, TypeScript, testing or accessibility skill.
If a suitable skill is available and your policy permits it, inspect its
source and permissions and optionally install it using your client's catalog.
Otherwise document the gap and proceed with the checked-in customizations.
Do not invent a skill name or assume that installing a skill runs a migration.

Compare the assessment agent and three prompts with your plan. Adapt them to
your organization's requirements only where needed. For example, require a
report of unverified assumptions, retain a human approval gate, or request
that failures leave dependent tasks incomplete.

If your Copilot client supports multiple agents, you may ask an independent
agent to review the plan. Otherwise start a separate conversation and provide
the plan and assessment. In either case, verify suggestions yourself; a
second agent is not a substitute for tests.

**Expected outcome:** customizations that guide the work without inventing
unsupported Angular executors or hiding errors.

---

# Level 3 — Modernize and independently verify

## Before you begin

Commit your baseline, assessment, plan and customization changes before
running Angular schematics. Check that `git status --short` is clean:
`ng update` refuses a dirty worktree by default. Ensure your chosen session
can read the plan and is operating in the intended branch and application
directory.

## Understand the multi-agent workflow

The original Java workshop demonstrates a specialized modernization
orchestrator. For Angular, the documented plugin does not offer that execution
workflow. You may instead use a general Copilot agent, or delegate genuinely
independent review and implementation tasks if your client supports multiple
agents. Keep dependency updates and writes to the same files coordinated; do
not assume that independent agents automatically share a working tree or plan.

## Step 1: Choose the execution model

Choose interactive execution with approvals, or delegate bounded tasks using
the capabilities available in your Copilot client. A single supervised agent
is sufficient. Keep the approved plan, guardrails and test gates visible to
every agent; use a separate reviewer later. Do not use blanket approval if it
conflicts with your organization's policies.

## Step 2: Start the implementation

In Copilot, give the reviewed plan and task graph to an agent and use
the contents of
`.github/prompts/implement-angular.prompt.md`:

```text
Execute my approved .github/modernize/angular/plan.md and tasks.json in
dependency order. Preserve the simulated /api/orders contract and the
baseline behavior. Use official Angular migrations where applicable; review
their changes and run tests and a production build at each gate. Stop on a
failed prerequisite, record evidence and leave dependent tasks incomplete.
```

Supervise commands and changes. You can perform the same work manually. From
`app/angular-order-service`, the version stages are:

```bash
npx ng update @angular/core@21 @angular/cli@21
npm test
npm run build
git status --short
# Review the changes, then commit the successful Angular 21 stage.
git add -A -- .
git commit -m "Upgrade Angular to 21"

npx ng update @angular/core@22 @angular/cli@22
# If NG4003 appears, enable strictTemplates as described below, then rerun.
npm test
npm run build
git status --short
# Review and commit the Angular 22 stage before the standalone schematic.
git add -A -- .
git commit -m "Upgrade Angular to 22"
```

Review each proposed package change, migration and compatibility requirement;
re-run the checks if you fix a failure. Do not skip a major, use `--force` to
hide incompatible peer dependencies, or commit a broken intermediate stage.
If a target package is unavailable in your approved feed, stop and document
the blocker.

**Migration hints:**

- The Angular 22 update can add `extendedDiagnostics` to `tsconfig.app.json`
  and `tsconfig.spec.json` while the starter still has `strictTemplates: false`.
  This causes build error `NG4003`. Set `angularCompilerOptions.strictTemplates`
  to `true` in `tsconfig.json`, resolve any reported template errors, and
  rerun the tests and build before committing the Angular 22 stage.
- Follow the official
  [application build-system migration](https://angular.dev/tools/cli/build-system-migration);
  it may be offered during an update. The `application` builder uses the
  newer esbuild/Vite-based tooling. Check the build output path: the automated
  migration changes this starter's browser output to
  `dist/order-service/browser`.
- Follow the three ordered modes of the
  [standalone migration](https://angular.dev/reference/migrations/standalone).
  Run `npx ng generate @angular/core:standalone` for each mode and inspect
  both application **and test** imports. Ensure the HTTP simulator remains
  registered when moving from `HttpClientModule` to `provideHttpClient`;
  a class interceptor requires the appropriate DI interceptor feature.
- Angular's update migrations may already convert the templates. If legacy
  directives remain, use `npx ng generate @angular/core:control-flow`; review
  `@if`/`@for` changes and tracking behavior against the
  [control-flow migration guide](https://angular.dev/reference/migrations/control-flow).
- Use [signals](https://angular.dev/guide/signals) where they improve local
  filter or derived summary state; do not blindly replace HTTP observables.
  Enable strict TypeScript and template checks and fix actual type errors.
- Preserve the existing Karma/Jasmine tests on the required path. Consider
  the experimental Vitest migration only after the required gates pass.

**Expected outcome:** a supported Angular 22 application with a modern build,
standalone and control-flow patterns, useful signals and stricter checks;
original behaviors and regression tests still work.

## Step 3: Observe the execution

Follow task progress, command output and agent decisions in your chosen
client. Compare each completed step with the corresponding task's
prerequisites and validation gate. If multiple agents are used, verify that
their changes and reports are actually integrated into the intended branch.
Stop and investigate failed commands or unsupported assumptions rather than
letting later tasks mask them.

## Step 4: Review the execution result

Compare the resulting diff, plan and task statuses. Check that the selected
Angular and TypeScript versions, application builder, standalone bootstrap,
control-flow templates, appropriate signals and strict checks are present.
Review the tests and error-handling changes, record any deviations and verify
that each claimed gate has command output. Leave incomplete work and
unresolved advisories visible.

## Step 5: Verify independently

Use a fresh Copilot conversation or a separate agent to review the resulting
diff against your plan and baseline. Ask:

```text
Independently verify the Angular migration against the assessment, approved
plan and original starter behavior. Inspect actual files and command output.
Check package compatibility, HTTP interceptor registration, the simulated API
contract, validation and error states, search/filter/sort/summary behavior,
accessibility, tests and build. List findings with file locations and
evidence. Do not assume the executing agent's report proves success.
```

Then perform these checks yourself:

1. Run `npm test` and `npm run build`; check `npx ng version` and the official
   compatibility table.
2. Start the app and repeat every Level 1 baseline scenario, including invalid
   input and full-page reload. Verify the form and dialog using a keyboard.
3. Inspect the diff, the task graph and any dependency advisories. Record
   warnings, failed checks and deferred work.
4. Fix confirmed regressions; rerun the affected checks. Do not mark a task
   complete merely because an agent says it is complete.

**Expected outcome:** evidence for behavior, version compatibility and build
health, plus a transparent list of any unresolved risks.

---

# Level 4 — Code review and triage

## Step 1: Find review instructions

Search the Awesome Copilot catalog or your organization's approved guidance
for review instructions relevant to Angular, TypeScript, accessibility and
security. Inspect their source and applicability. If none are suitable, ask
Copilot to propose concise review criteria based on the accepted plan.

## Step 2: Install or adapt the review instructions

Add or refine scoped review guidance for `app/angular-order-service` without
changing Java-specific instructions. Focus on observable regressions, API
contract preservation, dependency compatibility, accessibility and
evidence-backed security findings. Review the diff before saving it.

## Step 3: Commit and push the instructions

Commit the reviewed instructions and completed migration work, then push your
workshop branch to **your own fork**.

## Step 4: Request a Copilot review

Open a pull request in that fork against the branch you started from. If your
organization and Copilot plan permit it, request
[Copilot code review](https://docs.github.com/en/copilot/concepts/agents/code-review)
and ask reviewers to focus on behavior, migration correctness, accessibility,
security and tests. If the feature is unavailable, use a separate Copilot
conversation or a human review with the same scope.

Suggested review request:

```text
Review this Angular modernization for behavior regressions and incorrect
version migrations. Pay particular attention to interceptor registration,
standalone imports, control-flow tracking, form errors, signal state,
accessibility and whether the tests substantiate the claimed behavior.
Report concrete findings with locations and explain how to reproduce them.
```

## Step 5: Read the review feedback

Read every review comment alongside the relevant code and baseline. Ask the
reviewer for clarification when a finding lacks a reproducible scenario;
separate concrete defects from stylistic suggestions or unsupported claims.

## Step 6: Triage and address findings

For each finding, verify it in the diff and running application. Fix valid
issues and rerun relevant tests; explain and document false positives or
deferred work. Never accept a generated fix without reviewing its effect.

**Expected outcome:** a reviewable pull request with evidence-backed decisions,
not an unexamined list of suggestions.

---

# Bonus — Communicate the modernization

Ask Copilot to create a concise Markdown report or presentation covering the
starting architecture, target versions, migration decisions, verification
evidence, review findings, remaining risks and next steps. Include links to
the assessment, plan and pull request. Do not invent savings, security
guarantees or success metrics.

Optionally evaluate the experimental
[Karma-to-Vitest migration](https://angular.dev/guide/testing/migrating-to-vitest)
on a separate branch after the required path passes. Compare the test
coverage and behavior, document migration limitations and keep real-browser
coverage where it matters.

## Further reading

- [Angular version compatibility](https://angular.dev/reference/versions)
- [Angular update guide](https://angular.dev/update-guide)
- [Angular standalone migration](https://angular.dev/reference/migrations/standalone)
- [Angular application build system](https://angular.dev/tools/cli/build-system-migration)
- [GitHub Copilot customization](https://docs.github.com/en/copilot/concepts/prompting/response-customization)
- [Original Java workshop](https://github.com/ghsioux/ghcp-agentic-modernisation-lab/blob/main/docs/workshop.md)
