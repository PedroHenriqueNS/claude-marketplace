#!/usr/bin/env python3
"""Best-practices compliance gate for the marketplace.

Mechanical, deterministic checks that run identically locally and in CI.
The judgment-based audit (does `description` drive triggering, is reference
material split out) is the skill-auditor plugin's job, run on demand — see
docs/prds/best-practices-compliance-gate.md.

Hard failures (exit 1):
  - marketplace `name` uses a reserved claude-*/anthropic-* prefix
  - a plugin's marketplace.json version != its plugin.json version
  - a plugin `source` path doesn't resolve
  - a SKILL.md is missing `name` or `description` frontmatter
  - a repo-relative link (./ or ../) in a SKILL.md points at a missing file

Warnings (exit 0): SKILL.md over the size budget.

Source of truth for the rules: docs/CONVENTIONS.md › Claude Code best practices.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SIZE_BUDGET = 20_000  # bytes; warning only — leanness target, not a hard gate
LINK_RE = re.compile(r"\[[^\]]*\]\((<?[^)>]+)>?\)")

fails: list[str] = []
warns: list[str] = []


def frontmatter(text: str) -> dict[str, str]:
    """Parse the leading --- ... --- block into top-level scalar keys."""
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    out: dict[str, str] = {}
    for line in text[3:end].splitlines():
        m = re.match(r"([A-Za-z0-9_-]+):\s*(.*)", line)
        if m:
            out[m.group(1)] = m.group(2).strip().strip("'\"")
    return out


def check_skill(skill: Path) -> None:
    text = skill.read_text(encoding="utf-8")
    rel = skill.relative_to(ROOT)
    fm = frontmatter(text)
    if not fm.get("name"):
        fails.append(f"{rel}: missing `name` in frontmatter")
    if not fm.get("description"):
        fails.append(f"{rel}: missing `description` in frontmatter")
    size = len(text.encode("utf-8"))
    if size > SIZE_BUDGET:
        warns.append(f"{rel}: {size} bytes over {SIZE_BUDGET} budget — consider progressive disclosure")
    for target in LINK_RE.findall(text):
        if not (target.startswith("./") or target.startswith("../")):
            continue
        path = (skill.parent / target.split("#", 1)[0]).resolve()
        if not path.exists():
            fails.append(f"{rel}: dead repo-relative link -> {target}")


def main() -> int:
    catalog = json.loads((ROOT / ".claude-plugin" / "marketplace.json").read_text())
    name = catalog.get("name", "")
    if name.startswith("claude-") or name.startswith("anthropic-"):
        fails.append(f"marketplace name `{name}` uses a reserved prefix (claude-*/anthropic-*)")

    for entry in catalog.get("plugins", []):
        pname = entry.get("name", "?")
        source = (ROOT / entry.get("source", "")).resolve()
        if not source.exists():
            fails.append(f"plugin `{pname}`: source path does not resolve -> {entry.get('source')}")
            continue
        manifest = source / ".claude-plugin" / "plugin.json"
        if not manifest.exists():
            fails.append(f"plugin `{pname}`: missing plugin.json")
            continue
        pj = json.loads(manifest.read_text())
        if pj.get("version") != entry.get("version"):
            fails.append(
                f"plugin `{pname}`: version drift — marketplace.json {entry.get('version')} "
                f"!= plugin.json {pj.get('version')}"
            )

    for skill in sorted(ROOT.glob("plugins/*/skills/**/SKILL.md")):
        check_skill(skill)

    for w in warns:
        print(f"warn: {w}")
    for f in fails:
        print(f"FAIL: {f}")
    n_skills = len(list(ROOT.glob("plugins/*/skills/**/SKILL.md")))
    print(f"\nchecked {len(catalog.get('plugins', []))} plugins, {n_skills} skills — "
          f"{len(fails)} failure(s), {len(warns)} warning(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
