# Template: `docs/FEATURES.md`

What the product does, one block per feature.

Format rules:

- Each feature block has exactly these fields: **Purpose / Behavior / Implementation / PRD / Status**.
- **Status** is exactly one of `planned`, `in-progress` or `shipped`, plus a date: `shipped (YYYY-MM-DD)`.
- **PRD** links the feature's `docs/prds/<slug>.md`, or says `none` when the feature has no PRD.
- Implementation names the files or directories, so drift can be checked against the code.

````markdown
# Features

## <Feature name>

- **Purpose:** <the user problem it solves>
- **Behavior:** <what a user sees and does>
- **Implementation:** `<path>` <one line on how>
- **PRD:** [docs/prds/<slug>.md](./prds/<slug>.md)
- **Status:** planned (YYYY-MM-DD)
````
