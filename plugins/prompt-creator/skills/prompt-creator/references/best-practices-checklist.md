# Claude Code prompt-writing checklist (offline fallback)

> Distilled from <https://code.claude.com/docs/en/best-practices> on 2026-07-19. This file is the **fallback only** — when the live fetch works, the live page wins. If you are reading this because the fetch failed, tell the user the guidance may be stale.

The doc's core constraint: Claude's context window fills fast and performance degrades as it fills. A good prompt spends that budget well — it aims Claude precisely so the session doesn't burn context wandering or being corrected.

## The checklist

A strong Claude Code prompt has, where applicable:

1. **One scoped task.** Name the file/module, the scenario, and preferences. Not "add tests for the date utils" but "in `src/utils/date.ts`, add Vitest tests covering the DST-transition edge cases; no mocks."
2. **A check Claude can run, plus a demand for evidence.** Tests, a build, a linter, a diff script, a screenshot comparison — anything with a pass/fail signal. Ask Claude to run it, iterate until it passes, and show the output rather than asserting success. This closes the loop so the user isn't the verifier.
3. **Pointers to sources.** If a question has an authoritative source (git history, a spec, a doc page), direct Claude to it instead of letting it speculate.
4. **An exemplar pattern.** For new code, name an existing file that does it right and say "follow this pattern"; say whether new libraries are allowed.
5. **For bugs: symptom → likely location → definition of fixed.** Describe what users observe, where to look, and ask for a failing test that reproduces the issue before the fix.
6. **Plan-first for non-trivial work.** Instruct explore → plan → code (plan mode) so research is separated from implementation. A good spec is self-contained: names files and interfaces, states what is out of scope, ends with an end-to-end verification step.
7. **Rich content pasted in.** Exact error messages, stack traces, data samples, designs — not descriptions of them.
8. **Explicit non-goals.** What must not change, what is out of scope. Prevents over-engineering and collateral edits.
9. **One task per session.** Unrelated asks belong in a fresh session (`/clear` between tasks). If a session needed more than two corrections on the same issue, the winning move is a clean session with a better prompt that incorporates what was learned — which is exactly the prompt this skill produces.
10. **A review step for bigger tasks.** Ask for an adversarial review of the diff in a fresh subagent before "done" — and tell the reviewer to flag only gaps affecting correctness or stated requirements, so review findings don't drive over-engineering.

## When NOT to tighten

Vague prompts are legitimate for exploration — "what would you improve in this file?" surfaces things the user wouldn't think to ask. If the user's intent is exploratory, keep the rewrite open-ended instead of forcing scope and checks onto it.
