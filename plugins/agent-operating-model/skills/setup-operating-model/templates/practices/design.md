<!--
Template for docs/practices/design.md: how agents go from a design to a built screen.
Write it in the owner's language. Delete these comments.
-->

# {{Project}} — Design practices

Read by every lead and specialist who designs, prototypes or ports a screen.

## From reference to built screen

- The flow is: a reference, then a coded prototype the owner approves (shown as images), then code. No code before that approval.
- The approved prototype is the source of truth for layout, copy and behavior, and wins over any design skill. It is rebuilt in the project's stack, not copied.
- The built screen is compared with the prototype at each width; each difference is fixed or accepted by the owner. A fix in the product that departs from the prototype is recorded with the owner's call and copied back into the prototype.
- When the owner names a reference product, agents study that product itself and match its behavior. Other products inspire; they are never copied.

## No visual bugs, checked cheaply

- No visual bug in a prototype or a board, not even one labelled "only a proposal": it can be ported as if it were the design.
- Before a board reaches the owner, a quick, proportionate look compares each "after" with the published "before" (background, header, spacing, everything outside the proposed change).
- Captures are compared with a pixel-diff script first; an agent reads only the cropped region the script names, scaled down, never a full-page capture whole. A comparison script is trusted only after it was shown to answer "different".

## Porting

- Port block by block: list each block's structure before coding it. Reuse a shared component only where the reference shows it; a look-alike forced onto another block is a finding.
- A component or class is extracted at its second real use, not before.
- One source of design tokens holds every color; a color it lacks goes to the design lead. Nobody invents a token.
- Details agreed for one surface apply to every port. The brief names that list by its line range, and the report marks each item applied or not applicable.

## States and widths

- Every state (loading, empty, failure, limit) is drawn at a desktop and a phone width, with no horizontal scroll. The browsers not checked are named.
- The owner approves copy as an image of it in place, not as a list of sentences.
