<!--
Template for docs/practices/design.md: how agents go from a design to a built screen.
Write it in the owner's language. Delete these comments.
-->

# {{Project}} — Design practices

Read by every lead and specialist who designs or builds a screen.

## From reference to built screen

- A prototype is made only before a product exists to build on, or when the owner asks for one to think with. Once the product exists in code, a change to what is built is made in the code on the task's branch and tested on the app's own dev server, not in a prototype or a board.
- The owner approves captures of the running page at a desktop and a phone width, in each state, before the pull request leaves draft. Those captures and the published page win over any design skill.
- When the owner names a reference product, agents study that product itself and match its behavior. Other products inspire; they are never copied.

## No visual bugs, checked cheaply

- No visual bug in a capture shown to the owner, not even one labelled "only a proposal": it can be taken as the implementation.
- Before captures reach the owner, a quick, proportionate look compares each "after" with the published "before" (background, header, spacing, everything outside the change), at every width and state the change covers.
- Captures are compared with a pixel-diff script first; an agent reads only the cropped region the script names, scaled down, never a full-page capture whole. A comparison script is trusted only after it was shown to answer "different".

## Building

- Build block by block: list each block's structure before coding it. Reuse a shared component only where the design shows it; a look-alike forced onto another block is a finding.
- A component or class is extracted at its second real use, not before.
- One source of design tokens holds every color; a color it lacks goes to the design lead. Nobody invents a token.
- Details agreed for one surface apply to every screen built after. The brief names that list by its line range, and the report marks each item applied or not applicable.

## States and widths

- Every state (loading, empty, failure, limit) is shown at a desktop and a phone width, with no horizontal scroll. The browsers not checked are named.
- The owner approves copy as an image of it in place, not as a list of sentences.
