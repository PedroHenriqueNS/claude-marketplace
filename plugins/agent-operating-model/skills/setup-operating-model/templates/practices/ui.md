<!--
Template for docs/practices/ui.md: how agents build and review user interfaces.
Write it in the owner's language. Keep a line marked (option: <name>) only when the owner
turned that option on in the proposal, and drop the marker. Delete these comments.
-->

# {{Project}} — UI practices

Read by every lead and specialist who builds or reviews a screen. A rule here is checked by the reviewer like any other written rule.

## Screens for the least able user

- Management screens (dashboards, settings, billing) are built for the least able user: anyone may get lost or understand nothing. Their goal is delivering information, not converting.
- One clear message per state, in plain everyday words; the next step is always obvious; the status shows visually before any sentence; numbers and dates are concrete; details come only on demand.
- A screen is done when a user can finish its task alone, without support. Every screen review asks: would a user who understands nothing manage to understand and use this alone?

## Text on screen

- Text exists only to lead to the action or to answer a doubt the screen itself raises; everything else goes.
- Text that must exist (legal summaries, explanations of a state) is placed creatively: progressive reveal, a tooltip, the button's own microcopy, inline on demand. Never blocks of text.
- Excess text is flagged before the owner sees the screen, with a shorter option.
- Check the phone width first: how much of each card is text before its main element. Secondary text moves into an info icon, a tooltip, a disclosure or direct labels; never deleted, never below 11 px, reachable by keyboard and touch.
- Outside legal pages, no text, notice or alert may alarm the user without reason; where the point is to warn (a payment due, a delete button) it stays as strong as it must.
- No text a user reads names the owner as a person; it speaks as the team, except where a law requires the name.

## States

- Loading placeholders take the exact height of what replaces them, so nothing jumps; on failure they stop moving.
- A screen that takes something away (downgrade, cancel) lists concretely what the user loses, with no guilt copy. A slow change says how long it takes.

## Accessibility

- Every state works with the keyboard alone.
- Each issue names the WCAG criterion, the element and a concrete fix, backed by a computed contrast or a keyboard walkthrough.
- Accessible names are read from the browser's own accessibility tree, filled and empty, not from a test library's guess.
- An exception the owner accepts is recorded in the accepted-exceptions list (`docs/OPERATING-MODEL.md` § Decisions and facts).

## Devices

- Checks on a real device (in-app browsers included) are listed apart from the automated tests. A step that needs the owner's phone says so.
- (option: mobile-drawers) On a phone, never a modal: a drawer that opens from the bottom, draggable and able to cover the whole screen. A drawer that must not close easily (payment) is not draggable, ignores an outside tap and closes only by an explicit button. On desktop, a dense dialog is wider and split into zones of different weight, so the important items stand out; it fits the viewport.

- (option: keep-overscroll) The page's vertical overscroll is never turned off (it is the phone's pull-to-refresh); only inner scroll containers may contain it.

## Motion

- (option: motion) No hard cuts: every change of step or of state that swaps content animates. With `prefers-reduced-motion: reduce` there is no movement, only a short opacity crossfade. A small set of named motion tokens, short and interruptible; prefer `transform`/`opacity`; a layout-affecting animation is avoided, and allowed only with no jump, flicker or scroll jump; nothing runs while idle. Measured under CPU throttling (no long task, about 60 fps). A reviewer fails an instant swap.
