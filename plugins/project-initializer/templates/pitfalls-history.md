# Template: `docs/PITFALLS-HISTORY.md`

The full story behind each rule in `docs/PITFALLS.md` (see [pitfalls.md](pitfalls.md)). Nothing imports this file: no `CLAUDE.md`, `AGENTS.md` or other doc puts it on an import line. It is linked, entry by entry, from `PITFALLS.md`, so it has no size target.

Format rules:

- Each entry sits under the same heading text as its rule in `PITFALLS.md`.
- Each entry records symptom, cause, fix and dates. Nothing is cut from a story when its rule is shortened.
- Append; never delete an entry whose rule is still in `PITFALLS.md`.

````markdown
# Pitfalls — history

The full story behind each rule in [PITFALLS.md](./PITFALLS.md). Read an entry when its rule is not enough to decide.

## <Short name of the gotcha>

**Date:** YYYY-MM-DD

**Symptom:** <what went wrong, as observed>

**Cause:** <why it happened>

**Fix:** <what resolved it, with commits or PRs>

> TODO: Add the first story with the first entry in PITFALLS.md.
````
