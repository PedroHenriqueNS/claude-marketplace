# Template: `docs/PITFALLS.md`

Gotchas and non-obvious constraints, as rules. `CLAUDE.md` imports this file, so it holds only the rules; each rule's story lives in `docs/PITFALLS-HISTORY.md` (see [pitfalls-history.md](pitfalls-history.md)), which nothing imports.

Format rules:

- Each entry is a heading, its rule in 1–3 lines, and a link to the matching heading in `PITFALLS-HISTORY.md`, in this shape:

  ```markdown
  ## <Short name of the gotcha>

  <The rule, in 1–3 lines.> [History](./PITFALLS-HISTORY.md#<anchor-of-the-same-heading>)
  ```
- **Keep every "never" and "must".** A rule that loses its constraint is wrong. When shortening, each "never", "must", limit and exact value in the story stays in the rule.
- The heading is the same text in both files, so the anchor link resolves.
- A new project with no failures yet gets the skeleton below as is: the header and the TODO, no placeholder entry and no invented gotchas.

````markdown
# Pitfalls

Gotchas and non-obvious constraints, one rule per entry. Forward-looking coding rules live in [CONVENTIONS.md](./CONVENTIONS.md); the story behind each entry here (symptom, cause, fix, dates) is in [PITFALLS-HISTORY.md](./PITFALLS-HISTORY.md).

> TODO: Add the first entry when the first gotcha is found.
````
