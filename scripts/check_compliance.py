#!/usr/bin/env python3
"""Best-practices compliance gate for the marketplace.

Mechanical, deterministic checks that run identically locally and in CI.
The judgment-based audit (does `description` drive triggering, is reference
material split out) is the skill-auditor plugin's job, run on demand — see
docs/prds/best-practices-compliance-gate.md.

Hard failures (exit 1):
  - marketplace `name` uses a reserved claude-*/anthropic-* prefix
  - a plugin's marketplace.json version != its plugin.json version
  - a plugin's marketplace.json description != its plugin.json description
  - a plugin `source` path doesn't resolve
  - a SKILL.md is missing `name` or `description` frontmatter
  - a SKILL.md breaks an Agent Skills spec limit (agentskills.io/specification):
    `name` 1-64 lowercase letters/digits with single inner hyphens, equal to its
    directory name; `description` at most 1,024 characters
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
NAME_RE = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")  # no leading, trailing, or doubled hyphen
NAME_MAX, DESC_MAX = 64, 1024

fails: list[str] = []
warns: list[str] = []


def frontmatter(text: str) -> dict[str, str]:
    """Parse the leading --- ... --- block into top-level scalar keys.

    Handles single-line scalars (quoted or bare) and YAML block scalars
    (`>`, `|`, with optional chomp indicators). Without block-scalar support
    a `description: >-` with continuation lines parses to the literal ">-",
    which would let an effectively-empty description pass the presence check.
    """
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    lines = text[3:end].splitlines()
    out: dict[str, str] = {}
    i = 0
    while i < len(lines):
        m = re.match(r"([A-Za-z0-9_-]+):\s*(.*)", lines[i])
        if not m:
            i += 1
            continue
        key, val = m.group(1), m.group(2).strip()
        if val and val[0] in "|>" and val.strip("|>+-") == "":
            # block scalar — value is the following more-indented lines
            body = []
            i += 1
            while i < len(lines) and (not lines[i].strip() or lines[i][:1] in " \t"):
                body.append(lines[i].strip())
                i += 1
            out[key] = " ".join(b for b in body if b)
            continue
        out[key] = val.strip("'\"")
        i += 1
    return out


def spec_problems(name: str, description: str, dirname: str) -> list[str]:
    """Agent Skills spec limits on `name` and `description` (agentskills.io/specification)."""
    out = []
    if name and (len(name) > NAME_MAX or not NAME_RE.fullmatch(name)):
        out.append(f"`name` {name!r} breaks the spec: 1-{NAME_MAX} lowercase letters, digits, single inner hyphens")
    if name and name != dirname:
        out.append(f"`name` {name!r} doesn't match its directory {dirname!r}")
    if len(description) > DESC_MAX:
        out.append(f"`description` is {len(description)} characters, over the spec's {DESC_MAX}")
    return out


def check_skill(skill: Path) -> None:
    text = skill.read_text(encoding="utf-8")
    rel = skill.relative_to(ROOT)
    fm = frontmatter(text)
    if not fm.get("name"):
        fails.append(f"{rel}: missing `name` in frontmatter")
    if not fm.get("description"):
        fails.append(f"{rel}: missing `description` in frontmatter")
    for problem in spec_problems(fm.get("name", ""), fm.get("description", ""), skill.parent.name):
        fails.append(f"{rel}: {problem}")
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
        if pj.get("description") != entry.get("description"):
            # the Installed tab shows the marketplace one (Claude Code 2.1.265+), plugin.json elsewhere
            fails.append(f"plugin `{pname}`: description drift — marketplace.json and plugin.json differ")

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


def _selftest() -> int:
    """`python3 scripts/check_compliance.py --selftest` — verify the parser."""
    block = "---\nname: x\ndescription: >-\n  first line\n  second line\n---\nbody"
    assert frontmatter(block)["description"] == "first line second line", "block scalar"
    assert frontmatter('---\nname: x\ndescription: "hi"\n---\n')["description"] == "hi", "quoted"
    assert frontmatter("---\nname: x\ndescription: bare words\n---\n")["description"] == "bare words", "bare"
    assert frontmatter("---\nname: x\ndescription: >-\n---\n").get("description", "") == "", "empty block"
    assert spec_problems("pdf-processing", "ok", "pdf-processing") == [], "valid name"
    for bad in ("-pdf", "pdf-", "pdf--x", "PDF", "pdf_x", "a" * 65):
        assert spec_problems(bad, "ok", bad), f"bad name {bad!r}"
    assert spec_problems("pdf", "ok", "other"), "name != directory"
    assert not spec_problems("pdf", "x" * DESC_MAX, "pdf"), "description at the cap"
    assert spec_problems("pdf", "x" * (DESC_MAX + 1), "pdf"), "description over the cap"
    print("selftest ok")
    return 0


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        sys.exit(_selftest())
    sys.exit(main())
