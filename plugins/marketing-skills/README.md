# marketing-skills

A Claude Code plugin bundling **41 cross-referencing marketing skills** — they call each other (an SEO audit points to `ai-seo` and `schema`; `ai-seo` points to `competitors` and `copywriting`; and so on), so they ship together as one versioned unit.

Recreated from [github.com/coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) with Claude Code [best practices](https://code.claude.com/docs/en/best-practices) applied to every skill.

## Loading

This plugin lives under `~/.claude/skills/`, so Claude Code loads it automatically as `marketing-skills@skills-dir`. Run `/reload-plugins` (or restart) to pick it up. Skills are namespaced and invoked as `marketing-skills:<skill>`, e.g. `marketing-skills:seo-audit`.

## Skills

- **Acquisition / SEO:** `seo-audit`, `ai-seo`, `programmatic-seo`, `site-architecture`, `schema`, `content-strategy`, `competitors`
- **Conversion:** `cro`, `copywriting`, `copy-editing`, `offers`, `pricing`, `paywalls`, `popups`, `signup`, `onboarding`, `lead-magnets`
- **Channels:** `ads`, `ad-creative`, `emails`, `cold-email`, `social`, `video`, `public-relations`, `community-marketing`, `referrals`, `directory-submissions`
- **Sales / RevOps:** `prospecting`, `competitor-profiling`, `sales-enablement`, `revops`
- **Measurement & planning:** `analytics`, `ab-testing`, `customer-research`, `marketing-plan`, `marketing-ideas`, `marketing-psychology`, `churn-prevention`, `product-marketing`, `free-tools`

Each skill is a `skills/<name>/` directory with a `SKILL.md` plus `references/` and (mostly) `evals/`.

## What changed vs. the source

Faithful copies, with these best-practices fixes applied uniformly:

- Removed the non-standard `metadata.version` frontmatter key.
- Removed "You are a/an expert…" persona preambles from `SKILL.md` (skill behavior comes from the instructions, not a persona line).
- Replaced dead `../../tools/…` repo-relative links (which pointed at the source repo's infrastructure) with plain text.
- Added a `## Contents` table of contents to reference files over ~300 lines.
- Aligned `seo-audit`'s cross-references to the real skill names (`schema`, `cro`, `analytics`).

## ⚠️ Security note

These skills came from third-party authors and were security-reviewed before inclusion (no malware, prompt injection, data exfiltration, or hidden unicode found). A few skills **document live commands** you may choose to run when using them:

- `ad-creative` — `curl` examples for Google Gemini and ElevenLabs generation APIs (using *your own* API keys via env vars) and a `localhost` self-hosted endpoint.
- `public-relations`, `social` — read-only `curl` to public feeds (Google News RSS, Hacker News, Bluesky, YouTube RSS) for newsjacking / social listening.
- `directory-submissions` — `curl -sIL` to verify your own backlinks.

These are documentation, not auto-run code — review any command before executing it.
