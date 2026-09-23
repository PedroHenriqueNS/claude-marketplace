---
status: proposed
---

# Anthropic updates, 2026-06-26 → 2026-09-23: what this marketplace needs to change

**Serves product goal:** "Keep manifests valid (`claude plugin validate`) and versions in sync" ([PRD.md](../PRD.md#goals)) and "All skills and plugins in this repo MUST follow Claude Code best practices" ([CONVENTIONS.md](../CONVENTIONS.md#claude-code-best-practices-the-baseline-every-skill-follows)) — applied where this repo encodes Anthropic behavior that has since changed.

> **Basis.** Five channels, window 2026-06-26 → 2026-09-23, all fetched 2026-09-23 ([Sources & method](#sources--method)). Local shell CLI **2.1.267**; the window's newest release is **2.1.280**. Proposals cite F1–F25 in [Findings](#findings).

## Problem Statement

The repo hard-codes Anthropic behavior in a handful of places: model and effort facts in `prompt-creator`'s offline fallback and in [MODEL-NOTES.md](../MODEL-NOTES.md), doc URLs that `update-for-model` fetches live, an eval format no runner reads, and the best-practice checks `skill-auditor` performs. Over the window Anthropic shipped four models (Sonnet 5, Opus 5, Fable 5.1, Opus 5.5), 74 Claude Code releases, the `claude plugin eval` runner, and two native audit commands.

Almost none of it touches this repo — five plugins get "no action". What does touch it: `prompt-creator`'s fallback now implies the new default Opus model takes no effort level; `update-for-model` fetches its hubs through a cross-host redirect; `claude plugin eval` is announced, still gated on 2.1.267, and cannot read the repo's 47 `evals.json` files; two native commands cover part of `skill-auditor`; and two changes shift an open `linear-flow` decision.

## Per-plugin verdict

**Required** — a change breaks, deprecates or makes wrong something the plugin delivers today. **Recommended** — a concrete improvement; gain stated. **No action** — nothing in the window touches it.

| Scope | Verdict | Why | Proposal |
|---|---|---|---|
| `prompt-creator` | **Required** | Its fallback's effort list omits Opus 5.5 and says unlisted models take none — wrong for the default Opus whenever the live fetch fails (F2). | P4 (+ P1 pilot) |
| `project-initializer` | Recommended | `update-for-model`: hub URLs redirect cross-host (F13). The `project-initializer` skill: no action (R1). | P2 |
| `skill-auditor` | Recommended | `/skill-doctor` and `/claude-api prompt-audit` now measure what its Phase 2 estimates (F8, F9). | P5 |
| `linear-flow` | Recommended | Default auto mode and the new manual-only refusal change its open ⏳ trade-off (F10, F11). | P7 |
| `marketing-skills` | Recommended — manifest only | Its two manifest descriptions differ; the marketplace one now displays (F7). No search/citation change (F24): skills, `ai-seo` included, no action. | P8 |
| `nestjs-api-architect` | Recommended — manifest only | Same description drift; its `SKILL.md` description is 981 of the spec's 1,024 characters (F14). | P8 |
| `context-handoff` | No action | No Claude Code handoff feature shipped; the new compaction is API-only (R5). | — |
| `to-prd` | No action | Its manual-only skill inherits F10's refusal fix. | — |
| `azure-devops-card` | No action | Untouched by the window. | — |
| `tsconfig-upgrade` | No action | Its one eval file waits on Q3. | — |
| `test-optimizer` | No action | Untouched by the window. | — |
| Catalog (`marketplace.json`) | Recommended | Two descriptions to sync (F7); no new validation rule fires (R3). | P8 |
| Repo files | Recommended | MODEL-NOTES: P3 (Q1). `check_compliance.py`: P8. STACK.md, ROADMAP, CONVENTIONS › Testing: updated by P1/P6. `validate.yml`: no action (R3, Q5). CONVENTIONS › best practices: no action (R2). | P1, P3, P6, P8 |

## Proposals, prioritized

Preconditions: upgrade the shell CLI (Homebrew cask, 2.1.267) to ≥ 2.1.280 before P1 and P3. Every proposal that edits a plugin bumps its version in both manifests and in the prose of FEATURES.md, STACK.md and ROADMAP.md ([PITFALLS.md](../PITFALLS.md), 2026-07-31).

**P1 — Make the evals runnable under `claude plugin eval`, piloting `prompt-creator`. RECOMMENDED.**
*Files:* `plugins/prompt-creator/skills/prompt-creator/evals/`; [ROADMAP.md](../ROADMAP.md) (Phase 2, the Q6 gate); [STACK.md](../STACK.md); [CONVENTIONS.md › Testing](../CONVENTIONS.md#testing). *Motivated by:* F6. *Change:* convert the pilot's 8 cases into the runner's layout (`evals/**/case.yaml`, or `prompt.md` + `graders/*.md`) and delete `evals.json`; map the skill-absent case onto the built-in no-plugin arm (`--ablation with-without`) instead of porting it. If the report discriminates, schedule the other 46 files (Q3). *Why first:* without it every wording change in P4–P8 ships unverified — what ROADMAP Phase 2 and the `prompt-creator` Q6 gate wait on. *CLI:* ≥ 2.1.269 and early-access enablement — on 2.1.267 the command exits 1 with an early-access notice, and CL 2.1.269 does not say the gate is gone. *Verify:* `claude plugin eval ./plugins/prompt-creator` exits 0 with a JSON + HTML report and a with/without delta; compliance and validate pass.

**P2 — Point `update-for-model` at `platform.claude.com`. RECOMMENDED.**
*Files:* `plugins/project-initializer/skills/update-for-model/SKILL.md` (step 1 URL); `…/references/model-tuning-sources.md` (URL map rows 1, 2, 4 and its "verified" date). *Motivated by:* F13. *Change:* replace each `docs.claude.com` hub with the URL it resolves to (e.g. `https://platform.claude.com/docs/en/models/overview`) and note that overview and what's-new pages moved under `/docs/en/models/<model>/` while per-model prompting pages stay under `/build-with-claude/prompt-engineering/`; the discovery method stays. *Gain:* one hop per hub instead of a cross-host 302 that WebFetch reports rather than follows, costing a second fetch and risking a needless fallback. *CLI:* none. *Verify:* each URL in the map returns 200 without a redirect (`curl -sI`); compliance and validate pass.

**P3 — Re-target MODEL-NOTES to Opus 5.5, if Q1 says so. RECOMMENDED (conditional).**
*Files:* [MODEL-NOTES.md](../MODEL-NOTES.md), rewritten wholesale, plus links into it the skill proposes (approval-gated). *Motivated by:* F2, F3, F12. *Change:* after P2, run `/update-for-model` and choose Opus 5.5. *Why:* the notes are right for Opus 5, but `opus` now resolves to Opus 5.5, which always thinks, so their advice on disabling thinking no longer applies. The re-run should also weigh the new Concise output style against the verbosity row. *CLI:* choosing Opus 5.5 needs ≥ 2.1.280; the shell does not meet it. *Verify:* the skill's delta report; the header names Opus 5.5 with a 2026-09 fetch date; compliance passes.

**P4 — Refresh `prompt-creator`'s model fallback. REQUIRED.**
*Files:* `plugins/prompt-creator/skills/prompt-creator/references/model-selection.md` §2, §3, §5 and its distilled date. *Motivated by:* F2, F3, F5, F25. *Change:* (a) add Opus 5.5 to the effort-support sentence — it starts at a default effort of its own (CL 2.1.280) and the launch post runs it at `low`; take the exact levels from the live model-config page. (b) One line on `maxEffortLevel` (CL 2.1.267): a cap, top-level or per model, can lower an assigned effort. (c) If Q4 confirms forks keep the parent's model, one line in §3: an assignment lands only on a fresh subagent. (d) §5 says every custom subagent loads CLAUDE.md; `omitClaudeMd` (CL 2.1.271) is now the exception. *Why Required:* (a) makes the fallback wrong about the default Opus model the moment a fetch fails. *CLI:* none for the edit. *Verify:* each new line matches the live model-config or sub-agents page verbatim; P1 evals once they exist; compliance and validate pass.

**P5 — Let `skill-auditor` use the native audits instead of estimating them. RECOMMENDED.**
*Files:* `plugins/skill-auditor/skills/skill-auditor/SKILL.md` (Phase 1 inventory; Phase 2 "Context cost" and "Redundancy"). *Motivated by:* F8, F9. *Change:* Phase 1 asks the user to run the built-in `/skill-doctor` and paste its report (measured usage and context cost); Phase 2 invokes the bundled `/claude-api prompt-audit` for model-tuned anti-patterns instead of judging them unaided. The skill keeps project fit, adoption picks and new-skill drafts — a slimming, not a retirement. *Gain:* pruning advice rests on measured usage; Anthropic maintains the anti-pattern list. *CLI:* `/skill-doctor` ≥ 2.1.261 and `prompt-audit` ≥ 2.1.221; local 2.1.267 meets both. *Verify:* a dry run on this repo cites both reports; compliance and validate pass; P1 evals when available.

**P6 — Start the ⏳ model-guidance review from `/claude-api prompt-audit`. RECOMMENDED.**
*Files:* [ROADMAP.md](../ROADMAP.md) ("Follow-up from `update-for-model`"), then whatever `SKILL.md` files the audit flags. *Motivated by:* F9, F2. *Change:* run the audit over `plugins/*/skills/` and CLAUDE.md for the Q1 target model and triage its findings against CONVENTIONS, instead of hand-reviewing 61 descriptions. Close the ⏳ "should `update-for-model` edit sibling `SKILL.md` files" item as *no*: skill-level tuning now has a native tool. *CLI:* as P5. *Verify:* the report is linked from the ROADMAP item; each `SKILL.md` edit it drives passes compliance, validate and, after P1, evals.

**P7 — Re-decide `linear-flow`'s two open ⏳ findings. RECOMMENDED.**
*Files:* `description` of `plugins/linear-flow/skills/ln-issue-lifecycle/SKILL.md` and `ln-triage/SKILL.md`, their `evals/evals.json`, [ROADMAP.md](../ROADMAP.md). *Motivated by:* F10, F11. *Change:* now, anchor the four unanchored trigger phrases ("close these", "relabel these", "groom the backlog", "track this") to Linear; then decide `disable-model-invocation` for the write-heavy skill (Q2). *Why now:* since 2026-08-14 new Pro/Max/Team sessions default to auto mode, where a Linear write no permission rule covers is gated by a classifier, not a prompt (`ask`/`deny` rules still fire first) — while an unanchored phrase can load a write-capable skill into an unrelated task. F10 made the manual-only option cheaper: Claude, blocked from invoking such a skill, now asks the user to run it rather than re-enacting its steps. *CLI:* refusal behavior ≥ 2.1.222 (local meets it). *Verify:* negative trigger cases for the bare phrases, run under P1; validate and compliance pass.

**P8 — Close the spec and manifest gaps in the compliance script; sync two descriptions. RECOMMENDED (low).**
*Files:* `scripts/check_compliance.py` (checks and `_selftest`); `.claude-plugin/marketplace.json`; `plugins/{marketing-skills,nestjs-api-architect}/.claude-plugin/plugin.json`; the new rule in [CONVENTIONS.md](../CONVENTIONS.md). *Motivated by:* F7, F14. *Change:* (a) make the two drifted descriptions identical — the Installed tab now shows the marketplace one; (b) hard-fail on description drift between manifests (the version-sync pattern), on a `name` breaking the spec's pattern, length or directory match, and on a `description` over 1,024 characters. *Why now:* P6 and P7 will rewrite descriptions, and `nestjs-api-architect` has 43 characters of headroom. *CLI:* none. *Verify:* new `_selftest` asserts pass; 0 failures on the synced repo; `claude plugin validate .` passes.

### Rejected

**R1 — Native AGENTS.md reading (F15) → `project-initializer`.** Its CLAUDE.md template imports `@AGENTS.md` and carries Claude-specific notes; the native path applies only without a CLAUDE.md, and not on Bedrock, Vertex or Foundry.

**R2 — `/code-review` rework (F16) → CONVENTIONS' review step and MODEL-NOTES' deviation.** Still a bundled command reviewing the diff in a background subagent; both texts stay accurate.

**R3 — New validation and naming rules (F17).** All twelve validations pass on 2.1.267; `pedrohenriquens` imitates no reserved name. CI's unpinned `npm install -g @anthropic-ai/claude-code` will exercise the 2.1.280 rule, unverified locally.

**R4 — API-side skills and agents (F18).** Nothing here calls the Claude API; the plugins ship through Claude Code.

**R5 — Retired prompt-improver APIs; on-demand Messages API compaction (F18).** `prompt-creator` never called those APIs; `context-handoff` targets Claude Code, where no handoff feature shipped.

**R6 — MCP spec 2026-07-28 (F19).** `linear-flow` names no tools and discovers them live; transport is the server's concern.

**R7 — Tool and frontmatter mechanics the repo does not use (F20).** A grep finds no reference to TodoWrite, TaskCreate or TaskOutput, nor any skill-level `model:` or `effort:`.

**R8 — Install conveniences and new source types (F21).** The documented two-step install still works; nothing here needs another source type.

**R9 — Loops and the `/verify` pattern (F22).** No plugin overlaps them.

## Open questions

**Q1 — Target model for MODEL-NOTES: stay on Opus 5 or move to Opus 5.5?** Recommend Opus 5.5: `opus` now resolves to it (F2), and advice on disabling thinking cannot apply to a model that always thinks. The skill asks; this PRD does not decide.

**Q2 — `disable-model-invocation` for `ln-issue-lifecycle`?** Recommend anchoring the phrases first (P7), measuring with P1 evals, and setting it only if bare-phrase negatives still fire. `ln-triage` creates single items: lower risk.

**Q3 — P1 scope: pilot only, or all 47 eval files?** Recommend the pilot first; 39 of them belong to the derived `marketing-skills`.

**Q4 — Does a fork honor a per-spawn `model`?** F5's inherited prompt cache implies the parent's model, but no source in the window says so. Confirm on the live sub-agents page before P4(c).

**Q5 — Evals in CI?** They call a model: cost plus an API secret. Recommend manual or non-blocking runs until pilot scores are stable.

## Findings

De-duplicated across channels. `CL x.y.z` = changelog release; RN = release notes; the last column routes each item to a proposal, a rejection, or "covered" (already current here).

| # | Date | What changed (paraphrase) | Source | → |
|---|---|---|---|---|
| F1 | 06-30, 07-24, 09-01 | Sonnet 5, Opus 5, Fable 5.1 launched; each became its family's default in Claude Code (CL 2.1.197, 2.1.219, 2.1.257) | [CL][cl]; [RN][rn]; news: [Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5), [Opus 5](https://www.anthropic.com/news/claude-opus-5) | covered |
| F2 | 09-22 | Opus 5.5 launched as the default Opus: 1M context, always thinks (cannot be disabled), starts at its own default effort; min CLI 2.1.280 | [CL][cl] 2.1.280; [RN][rn]; [blog](https://claude.com/blog/what-a-task-costs-on-opus-5-5) | P3, P4 |
| F3 | 08-28 → 09-22 | `/effort` saves a level per model (2.1.251); earlier saved levels skip new models (2.1.280); `maxEffortLevel` caps effort (2.1.267); Opus 5 with thinking off sends `xhigh`/`max` as `high` (2.1.251) | [CL][cl] | P3, P4 |
| F4 | 07-01 → 09-01 | Subagent model resolution: env var is now a default (2.1.251), a FORCE switch (2.1.257), org-blocked aliases step down with a warning (2.1.222–223), Explore inherits the session model (2.1.198) | [CL][cl] | covered (fallback distilled 09-09) |
| F5 | 08-13 | Forking on by default; a fork inherits the parent's conversation and prompt cache (2.1.232) | [CL][cl] | P4, Q4 |
| F6 | 09-11 | `claude plugin eval` added (2.1.269). On 2.1.267 it exits with an early-access notice; its `--help` names `evals/**/case.yaml` or `prompt.md` + `graders/*.md` and a built-in no-plugin arm | [CL][cl]; local CLI | P1 |
| F7 | 09-08 | Installed tab and `claude plugin details` prefer the marketplace entry's metadata over `plugin.json` (2.1.265) | [CL][cl] | P8 |
| F8 | 09-04 | `/skill-doctor` shows unused loaded skills and their context cost (2.1.261) | [CL][cl] | P5 |
| F9 | 08-04 | The `claude-api` skill gains `prompt-audit`, flagging prompts written for older models (2.1.221); the Opus 5.5 post (09-22) aims it at skills and CLAUDE.md | [CL][cl]; [blog](https://claude.com/blog/what-a-task-costs-on-opus-5-5) | P5, P6 |
| F10 | 08-04 | A blocked auto-invocation of a manual-only skill now has Claude ask the user to run it (2.1.222) | [CL][cl] | P7 |
| F11 | 08-07 (live 08-14) | Auto mode becomes the default for new Pro/Max/Team sessions: a classifier targeting irreversible, destructive or outside-environment actions replaces per-call prompts; permission rules still fire first | [blog](https://claude.com/blog/auto-mode-default-in-claude-code) | P7 |
| F12 | 08-20 | Built-in "Concise" output style (2.1.237) | [CL][cl] | P3 |
| F13 | checked 09-23 | The repo's five `docs.claude.com` URLs answer 302 to `platform.claude.com` (all reach 200); overview and what's-new pages moved under `/docs/en/models/`, prompting pages did not | local link check; [RN][rn] | P2 |
| F14 | — | Agent Skills spec: all 61 skills conform; the compliance script enforces neither the `name` pattern nor the 1,024-character `description` cap (longest today: 981) | [spec][spec]; local | P8 |
| F15 | 09-18 | AGENTS.md is read when a project has no CLAUDE.md (2.1.277) | [CL][cl] | R1 |
| F16 | 06-29 → 09-17 | `/code-review` reworked: background subagent (2.1.218, 2.1.232), leaner prompts on models without tuned settings (2.1.274) | [CL][cl] | R2 |
| F17 | 06-29 → 09-22 | Validation and naming: `validate --json`, Desktop-sync name warnings, bare `.claude/skills` checks, reserved-name imitation refused | [CL][cl] | R3 |
| F18 | 07-17 → 09-14 | API-side: Agent Skills, Skills API and Files API GA, SDK renames, Managed Agents skills from GitHub, `ant apply`, prompt-improver APIs retired, Messages API compaction | [RN][rn]; [blog](https://claude.com/blog/computer-use-skills-api-files-api) | R4, R5 |
| F19 | 07-28 | MCP spec 2026-07-28: stateless core, OAuth hardening | [blog](https://claude.com/blog/bringing-mcp-2026-07-28-to-claude) | R6 |
| F20 | 08-04 → 09-18 | Todo/task tools off on newer models, TaskOutput removed, skill `model:`/`effort:` fixes, boolean spellings, BOM fixes | [CL][cl] | R7 |
| F21 | 08-07 → 09-17 | Install conveniences: archive, command and GitLab sources, inline `--marketplace`, claude.ai skill sync | [CL][cl] | R8 |
| F22 | 06-30, 07-22 | Loop patterns (`/goal`, `/loop`, `/schedule`); verification loops packaged as skills | blog: [loops](https://claude.com/blog/getting-started-with-loops), [verify](https://claude.com/blog/building-verification-loops-in-claude-code-with-skills) | R9 |
| F23 | 07-07 → 08-21 | Guidance posts: model and effort choice (already cited by the fallback), model tiers, subagent definitions, SDLC playbook | [blog](https://claude.com/blog/claude-model-and-effort-level-in-claude-code) + 3 more | covered |
| F24 | — | Search and citation: no item in any channel | all | `ai-seo`: no action |
| F25 | 09-14 | Agent frontmatter gains `omitClaudeMd`: custom and plugin subagents can run without CLAUDE.md files (2.1.271) | [CL][cl] | P4 |

## Sources & method

Read on 2026-09-23 by five fresh subagents, one per channel, each on a pinned model; a sixth reviewed this PRD.

| Ch. | Source | Enumeration | Model | In window | Read | Flagged |
|---|---|---|---|---|---|---|
| A | [Claude Code changelog][cl] (`.md`, ~800 KB) | Scripted slice from the top through the 2.1.195 block (June 26) | sonnet | 74 releases | 74 | 48 (+50 borderline discards) |
| B | [Platform release notes][rn] (`.md`) | `### <date>` sections ≥ June 26, dates parsed in code | haiku | 29 sections, 78 bullets | 78 | 64 |
| C | [claude.com sitemap](https://claude.com/sitemap.xml), `/blog/` | English URLs with `lastmod` ≥ June 26 (145), then JSON-LD `datePublished` in window | sonnet | 74 posts | 24 | 12 |
| D | [anthropic.com sitemap](https://www.anthropic.com/sitemap.xml), `/news/` + `/engineering/` | Same rule as C (170 + 1 URLs) | sonnet | 29 + 0 posts | 29 | 2 |
| E | [Agent Skills spec][spec] (`.md`, undated) | Spec rules × 61 `SKILL.md` frontmatters × `check_compliance.py` | haiku | — | 12 rules × 61 skills | 0 violations; 6 script gaps |

- "Flagged" counts precede de-duplication; B's was over-inclusive (Managed Agents, admin and pricing narrowed here). B's first pass read ~35 of 78 bullets; a scripted count caught it and B re-ran. D matched the raw `/news` listing.
- Local checks, same day: `claude --version` → 2.1.267; `claude plugin validate` clean for the marketplace and all 11 plugins; `scripts/check_compliance.py` 0 failures, 5 unrelated size warnings; `curl` check of the repo's Anthropic doc URLs (F13); `claude plugin eval --help` and a run on a scratch copy (F6); re-measured numbers (61 skills; longest description 981 characters; longest `SKILL.md` 485 lines; `disable-model-invocation` only in `to-prd`).
- Unverified locally: anything needing 2.1.280 (Opus 5.5, its validation rule) and whether a newer CLI or account setting lifts the eval gate (F6).

[cl]: https://code.claude.com/docs/en/changelog
[rn]: https://platform.claude.com/docs/en/release-notes/overview
[spec]: https://agentskills.io/specification
