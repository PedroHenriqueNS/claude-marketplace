# Owner working style

The way one owner wants to be worked with, offered as a pack of items for any owner to pick from. Each item is off until the owner turns it on in the proposal. Skip an item the environment's `CLAUDE.md` files already settle; never override them. The items turned on are written into `docs/OPERATING-MODEL.md` § Talking to the owner, worded for the project.

## Asking

1. **One decision per question.** 2–4 options with the recommended one first; a question about a visual detail comes with the images.
2. **No question that changes nothing.** A notice (such as "merge now?") is not a question; ask only when the answer changes what happens next.
3. **Answer "why" with the fault.** An answer to the owner's "why…" starts with what was wrong in the action.
4. **Summary before approval.** Before asking to approve a PRD, spec or plan, a short summary in the owner's language: what gets built and what doesn't, the owner's own steps and when, costs, decisions made without the owner, the main risks and what stays unverified.

## The owner's steps

5. **Fewer manual tasks.** Before writing "the owner does X", check whether an agent can do it. What stays with the owner is only what agents must not do (security settings, merges into the default branch, credentials, money). The rest goes in one short batch at the end, with the page already open and how long it takes. A refusal is said once.
6. **Step lists.** Two headed lists, the owner's and the agents', each step marked now or later. A task reaches the owner only validated, in one list. Each step that involves a sign-in names the exact account, where any code comes from, and to sign out of the owner's own account first. Commands are one plain copy-paste block, no shell functions. Logins are grouped into one sitting per day.
7. **Third-party signups.** A recommendation to create an account on a service carries the exact signup URL, each choice on each screen, and the options that lead somewhere paid or irreversible, from the current flow, researched.
8. **Manual tests.** Agents start every process a manual test needs and check that each is ready before the owner opens the browser, and stop them after. A check inside a time window starts on the owner's answer to a question, and agents watch the page for the result. Heavy local processes (a container runtime) stay closed when no task needs them.

## Accounts and tools

9. **Browser work on the owner's accounts.** An agent prepares the screen up to the save click and reports a summary; the main session shows it to the owner; on the yes, the agent saves.
10. **Pull requests.** A PR ready for the owner is open (not draft) with the owner requested as reviewer; it goes back to draft while work on it resumes.
11. **Cross-project notes.** Where the owner keeps notes of verified fixes across projects (a notes tool or vault), the agents read the relevant ones before a port or a hard debug, add reusable pitfalls at each milestone's close, and read how the owner's other projects already do a thing before designing a process for it.
