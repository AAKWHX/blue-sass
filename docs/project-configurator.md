# Structured project requests

The `/[locale]/quote` page now uses the six-step `ProjectBuilder`. Request editing uses the same component at `/[locale]/portal/projects/[id]/edit`. The old estimator is no longer rendered.

## Scope and pricing

- 34 project kinds in six families; existing 19 website packages keep their prices.
- Seven sign-in methods, including an included email/password provider adapter. A login system itself is a separate authentication module when not already included in the package.
- Twelve selectable project languages. One is included; each additional language costs EUR 125 for implementation. Translation and writing are excluded.
- Eight optional services, eleven extra modules and six media/performance/storage options. Monthly, yearly and one-time totals remain separate.
- Provider integration fees: Google EUR 25, Apple EUR 35, Microsoft EUR 25, GitHub EUR 20, Facebook EUR 30, LinkedIn EUR 30. External provider licences/fees are not included.
- Existing implementation promotions apply only to the core implementation estimate, not recurring services or separately priced integration/setup options.
- The existing PayPal amount is a reservation deposit, not the whole project price. No automatic recurring billing was introduced.
- Delivery requests have scope-dependent lower bounds. The simplest landing/design scopes have a minimum of three days. More complex systems require substantially longer. No deadline is set on an unpaid new request.

## Data and security

An additive `project_requests` table stores a versioned JSON configuration and a server-calculated quote snapshot. The project ID is its primary key, and deleting a project cascades to this record. No existing tables or customer requests are removed.

`scripts/apply-project-request-migration.mjs` runs before production builds. It creates the table only when `DATABASE_URL` is configured, and does not log credentials. Migration failure stops the build.

Every mutation authenticates its caller, validates allowlisted options, ignores client price claims, and locks the project row before checking ownership, phase and lifecycle. Pending/paid payments block configuration changes. Design-started and cancelled requests cannot be edited. These checks are repeated on the server, not just hidden in the UI. Checkout also locks the project row, preventing a payment/configuration race.

For legacy unpaid requests, editing can create a structured configuration after ownership and lifecycle checks. Legacy free-text summaries remain readable; they are not parsed as an authoritative quote.

Capture remains dependent on verified PayPal `COMPLETED` status. Confirmed payment sets the estimated deadline relative to payment time using the saved delivery duration. The requested delivery is an estimate requiring team confirmation.

## Verification

Run `node --test scripts/project-configuration.test.mjs`, `npm run typecheck`, `npm run lint` and `npm run build`. The configuration suite covers all kinds/locales, cost separation, language/provider pricing, incompatible/unknown/duplicate options, minimum delivery, domain validation and mandatory package modules.

Local visual checks used a temporary development-only fixture, removed before deployment. Arabic mobile (390px), desktop (1280px), review pencil navigation and English/mobile type switching were checked. Actual authenticated request persistence and payment execution require a signed-in test account and are not established by visual/unit checks alone.
