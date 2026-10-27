# Template: `docs/STACK.md`

The detailed tech stack: languages, frameworks, libraries with versions, infrastructure, external services, dev tools. The "what we use and why" document.

Format rules:

- **Pins:** a `| Package | Version | Why |` table, filled from the manifests the survey read (`package.json`, `pyproject.toml`, `go.mod`, …). Versions are copied exactly as the manifest states them; never write a version from memory.
- Under the table, one line of pin policy (exact pins, caret ranges, lockfile as truth, …). When no policy can be inferred from the manifests, that line is a TODO.
- Services, infrastructure and dev tools that are not packages go in their own short sections.

````markdown
# Stack

## Languages and runtimes

- <Language> <version> — <why>

## Pins

| Package | Version | Why |
|---|---|---|
| <package> | <version from the manifest> | <what it is used for> |

**Pin policy:** <how versions are pinned and upgraded>.

## Infrastructure and services

- <Service> — <role>

## Dev tools

- <Tool> — <role>
````
