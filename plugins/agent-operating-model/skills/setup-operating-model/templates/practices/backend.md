<!--
Template for docs/practices/backend.md: APIs, servers, workers and their data.
Write it in the owner's language. Keep a line marked (option: <name>) only when the owner
turned that option on in the proposal, and drop the marker. Where the project's own
CONVENTIONS already set a rule here, point at it instead. Delete these comments.
-->

# {{Project}} — Backend practices

Read by every lead and specialist who writes or reviews server code, data or integrations.

## Responsibilities

- Single responsibility: a controller maps the route, reads the request and calls one use case; one use case per service; one operation per repository or gateway.
- One gateway is the only code that talks to each outside system. A vendor's SDK is imported only in that boundary folder (enforced by lint where possible).
- The backend alone decides what is valid. Client checks exist for speed, may be looser, and lose when the two disagree.
- Business limits, prices and previews are computed once in the backend; the UI shows the API's values and keeps no copy.

## Integrations

- A webhook verifies its origin, dedupes by event id, answers fast and hands the work to a worker.
- Every wait on an external system has a time limit. No third-party call runs inside a database transaction.
- Background work on the request path never throws into the response.
- An error leaving the API never names an internal service or relays a provider's raw message.

## Data

- Money is integer cents with a currency; time is UTC until it is displayed.
- Migrations own all schema changes: `up()` is idempotent, `down()` mirrors it, and up-down-up is shown as evidence. A migration that destroys data says what its `down()` cannot restore.
- Event envelopes are additive only; a breaking change is a new event type. Consumers dedupe by event id. No code or test assumes read-after-write on an eventually consistent store.

## Tenants

- Every tenant query is scoped in the query itself, and every new route ships with its cross-tenant test.
- No answer reveals whether a record exists for another tenant, and no answer echoes back what the request sent.

## Tests

- No test calls a real third party; the HTTP layer is faked.
- Persistence tests run against a real database in a container, never a mock. Container images are pinned by digest and pulled before the run.
- A scale question is answered by a measurement in a throwaway container, removed afterwards, not by an estimate.
- (option: coverage-baseline) Coverage is first measured and recorded as a baseline; it becomes a gate in the next milestone.
