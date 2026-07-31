# Bulk grooming — dry-run protocol and recipes

Bulk changes are the highest-blast-radius thing this plugin does: one bad filter silently rewrites dozens of issues, and Linear has no undo for a sweep. The protocol exists so a mistake is caught while it is still a list on screen.

## Dry-run protocol

1. **Query, then show the set in full** — identifier and title for every issue. Never summarize as a count or a filter description; the whole point is that the user reads the actual rows and spots the one that does not belong.
2. **Show the change per issue**, not just in the aggregate. "Add the label" is aggregate; "12 issues get it, 3 already have it and are skipped" is per-issue.
3. **Approval is for the list**, not for the intent. If the set changes — a re-query returns different rows — re-show and re-approve.
4. **Apply one issue at a time.** A batch that half-fails must leave a readable trail of which half.
5. **Report per issue**, including skips and failures, and the resulting state.

## When to refuse and narrow instead

- The set is too large to display. That is a filter problem, not a display problem — narrow by team, label, status, or date and re-run.
- The filter is defined by something not in the query (`"the stale ones"`, `"everything from that sprint"`). Turn it into an explicit query first and show what it matched.
- The change is destructive and the set was not user-specified — closing, cancelling, or deleting issues found by a heuristic. Ask for the list to be confirmed item by item, or decline the heuristic and ask for explicit criteria.

## Recipes

**Relabel a set.** Query by the current label or status. Watch for single-select groups: adding a value there replaces the existing one rather than accumulating, so show both the added and the displaced value per issue.

**Sweep an unlabeled backlog.** Query issues missing a required label group. Do not infer the label from the title — propose a grouping, show which issues you would put in each bucket, and let the user correct the buckets before anything is written.

**Close stale issues.** "Stale" must be an explicit query (no update since a date, in a given status), never a judgment. Show the list with each issue's last-updated date so the cutoff is visible and arguable. Prefer moving to a triage status over closing outright.

**Reassign or re-parent.** Show the current owner or parent alongside the proposed one per issue — a bulk reassign that silently overwrites an existing assignee is the classic way this goes wrong.
