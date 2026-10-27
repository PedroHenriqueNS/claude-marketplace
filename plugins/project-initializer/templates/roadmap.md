# Template: `docs/ROADMAP.md`

The phased plan: what ships in each phase, what is deferred, what is in flight.

Format rules:

- Each phase heading carries its status: `planned`, `in-progress` or `done`.
- Each phase ends with a checkable **Done when:** line: a condition someone can verify, not an aspiration.
- Add the sentence "Each phase starts only when the previous phase's gate is met." under the title **only** when the user said, during the survey, that the phases are sequential. Otherwise leave it out.
- A feature PRD added later is registered here as well as in `docs/FEATURES.md`.

````markdown
# Roadmap

## Phase 0 — <Name> (in-progress)

- <What ships in this phase.>

**Done when:** <a checkable condition, such as "the API answers /health in staging and CI is green on main">.

## Phase 1 — <Name> (planned)

- <What ships in this phase.>

**Done when:** <a checkable condition>.

## Deferred

- <Work explicitly out of the current phases, and why.>
````
