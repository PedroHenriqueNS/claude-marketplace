<!--
Template for docs/practices/security.md: auth, personal data, payments and security testing.
Write it in the owner's language. The pre-launch posture lives in docs/OPERATING-MODEL.md
§ Security posture; don't repeat it here. Delete these comments.
-->

# {{Project}} — Security practices

Read by every lead and specialist who touches auth, personal data or payments, and by every security reviewer or tester.

## Auth

- Authentication is done with absolute certainty. Every vendor fact comes from the vendor's current docs, with the page and the date it was read; never from memory.
- Each auth choice is put to the owner explicitly, and the spec records who decided what.
- A risky vendor flow is proven before any code: on a development instance, with a test user, within the vendor's published limits. A proof that contradicts the design stops the plan.

## Personal data

- Agents receive counts, never rows or exports of personal data. A script over real data prints counts and ids only.
- Logs and failure reports carry codes, ids and durations: never what a user typed, never a third party's raw error message.
- An admin command over personal data runs as a dry run by default.

## Security testing

- No written scope, no assessment: targets, kinds of test, dates and exclusions.
- Local or staging only, never production. Defensive only, nothing destructive, no real personal data; the smallest proof, then stop.
- A finding is described by its effect, condition, defense and test, with no attack procedure, and ranked by a standard score. A secret found is never copied into a report.
- Cheap checks run along the way (a light review of each risky diff, dependencies the diff changed); one full assessment runs before the first real users.
- A finding is fixed test first: a failing test that reproduces it, the smallest change that closes it, then the full suite. Defenses are layered, so one failing check does not open the hole.
