# Owner working style

The way one owner wants to be worked with, offered as a pack of items for any owner to pick from. Each item is off until the owner turns it on in the proposal. Skip an item the environment's `CLAUDE.md` files already settle; never override them. The items turned on are written into `docs/OPERATING-MODEL.md` § Talking to the owner, worded for the project.

## Asking

1. **One decision per question.** 2–4 options with the recommended one first; a question about a visual detail comes with the images. The question box holds questions only: the answer, recommendation and reasons go in the message; the question is one short sentence and each option a short label.
2. **No question that changes nothing.** A notice (such as "merge now?") is not a question; ask only when the answer changes what happens next.
3. **Answer "why" with the fault.** An answer to the owner's "why…" starts with what was wrong in the action.
4. **Summary before approval.** Before asking to approve a PRD, spec or plan, a short summary in the owner's language: what gets built and what doesn't, the owner's own steps and when, costs, decisions made without the owner, the main risks and what stays unverified.

## The owner's steps

5. **Fewer manual tasks.** Before writing "the owner does X", check whether an agent can do it. What stays with the owner is only what agents must not do (security settings, merges into the default branch, credentials, money). The rest goes in one short batch at the end, with the page already open and how long it takes. A refusal is said once.
6. **Step lists.** Two headed lists, the owner's and the agents', each step marked now or later. A task reaches the owner only validated, in one list. Each step that involves a sign-in names the exact account, where any code comes from, and to sign out of the owner's own account first. Commands are one plain copy-paste block, no shell functions. Logins are grouped into one sitting per day. A step that waits for the main session's clearance enters the owner's list only in the message that clears it.
7. **Third-party signups.** A recommendation to create an account on a service carries the exact signup URL, each choice on each screen, and the options that lead somewhere paid or irreversible, from the current flow, researched.
8. **Manual tests.** Agents start every process a manual test needs and check that each is ready before the owner opens the browser, and stop them after. A check inside a time window starts on the owner's answer to a question, and agents watch the page for the result. Heavy local processes (a container runtime) stay closed when no task needs them.

## Accounts and tools

9. **Browser work on the owner's accounts.** An agent prepares the screen up to the save click and reports a summary; the main session shows it to the owner; on the yes, the agent saves.
10. **Pull requests.** A PR leaves draft when validated; the owner is requested as reviewer only after its ready CI run ends green, and only then is it ready for the owner. It goes back to draft while work on it resumes.
11. **Cross-project notes.** Where the owner keeps notes of verified fixes across projects (a notes tool or vault), the agents read the relevant ones before a port or a hard debug, add reusable pitfalls at each milestone's close, and read how the owner's other projects already do a thing before designing a process for it.

## Commands, holds and sources

12. **Commands: complete, one line each.** All commands in one message, each a self-contained line with its own check; a line that pipes a secret checks the value's shape and refuses an empty one.
13. **A hold names its condition.** Every hold or "later" says what it waits for, who clears it and whether an agent can clear it now; if one can, offer that as the question.
14. **What remains comes from a sweep.** What remains for a milestone comes from a sweep of the sources, each item with file and line, never from memory.
15. **A step on an account cites its design.** An owner step that touches an account cites the design section it follows; a runbook reviewer checks it.
16. **Third-party screens only with a source.** Where something sits on a third-party screen comes from the runbook or an agent's reading that day; otherwise say "I don't know, an agent will look".

## Talking

17. **The owner's personal affairs.** The literal question is answered first; a text the owner sends to a third party is drafted only from facts and motives he gave; legal or tax matters are in plain language, from a sourced answer.
18. **After a correction, no agenda.** A reply to a correction or a pause holds what was understood (his words), what changed and its evidence; the paused work resumes only on his message naming it.
19. **"You" is the organization.** An instruction to "you" is to the organization: the main session follows its content and picks who executes it.
20. **Repeated emphasis is not a new rule.** A repeated rule with emphasis is recorded as a repetition of that rule, cited; a stronger variant is asked, never written.
