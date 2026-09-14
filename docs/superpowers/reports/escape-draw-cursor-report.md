# Escape/draw/cursor fix — completed

Status: fixed, verified in the real browser, committed. Follow-up to the
earlier stop-and-report (root-cause section preserved below).

## Authorized changes (both to `stopDrawing()`/`startDrawing()`'s recreate mechanism)

**Change 1 — narrow the trigger.** `stopDrawing()` now only marks the Terra
Draw instance for terra-draw#710 recreation when the session that just ended
actually placed a coordinate. Signal used: Terra Draw's own mode-state
machine, read via `TerraDraw.getModeState()` (exported type
`TerraDrawModeState`), which transitions `'started'` (armed, no coordinate
committed) -> `'drawing'` the instant the first vertex lands
(`TerraDrawPolyLineMode`'s internal `setDrawing()`, confirmed against
`terra-draw`'s own source — it throws if called outside `'started'`, so this
transition is exactly "placed a real vertex," nothing looser). New private
`_hasPlacedVertex()` wraps this; `stopDrawing()` reads it into a `placedVertex`
local **before** calling `setMode('static')`, since switching the active mode
away resets its own state. This is Terra Draw's own state, not an inference
from this service's flags — an armed-but-empty session (arm-on-entry with
nothing selected, then cancelled by `Escape` before any click) never engaged
the adapter's pointer capture, so it no longer pays for a recreate it doesn't
need.

**Change 2 — re-time it eagerly.** For a session that DID place a vertex,
`stopDrawing()` now calls `_recreateTerraDraw()` directly, synchronously,
right there — not deferred to the next `startDrawing()` call as before. The
old lazy field `_terraDrawNeedsRecreate` is gone; `startDrawing()` now just
checks `!this._terraDrawReady` and queues via `_pendingStartDrawing` if a
recreate (this one or any other) is still in flight, exactly the same safety
net as before, generalized. This matters because narrowing the trigger alone
does not remove the swallowed-click race — it only makes it rarer — since a
genuine multi-field session's SECOND (and later) draw still starts from a
real prior recreate; eager timing gives the new instance the rest of the
"user looking at what they just drew" time to finish coming up before the
next click can possibly race it.

## Real-browser verification (live Storybook, `:6007`, not restarted)

- **Exact reported cascade**, zero delay: entered edit mode with nothing
  selected (auto-arms, F6) -> 2 real `Escape` keydowns (cancels the empty arm,
  then leaves edit mode) -> real click on the draw button -> real
  `pointerdown`/`pointerup` draw, no wait between button and first vertex.
  Result: `isDrawing` flips `true` **synchronously** on the button press
  (`_terraDrawReady` stayed `true` throughout — no recreate was ever needed,
  confirming Change 1), every placed vertex read `terraDrawReady: true,
  pendingStart: false`, and the draw closed into a new, selected,
  `editable: true` feature. Cursor traced `crosshair` (arm) ->
  `openhand` (both Escapes) -> `crosshair` (re-arm) -> `openhand` (draw
  finished) — resolves on its own, exactly as predicted; **no separate
  cursor-reset code was added**, per the instruction to check first.
- **terra-draw#710 protection under the narrowed trigger**: 3 consecutive
  real `page.mouse.click()`-driven draws (not synthetic events) against the
  same live session, each a full 4-corner-plus-close polygon. All 3 closed
  successfully, feature count incremented by exactly 1 each time
  (4 -> 5 -> 6), `terraDrawReady` back to `true` after each. Also confirmed
  via the synthetic-`PointerEvent` technique (see below) across 3 draws with
  varying pixel offsets: same result. No sign of the narrowed trigger letting
  #710 back in.

## Automated coverage added (`google-maps.stories.ts`)

New helpers `placeVertex()`/`drawSquare()`: dispatch synthetic
`pointerdown`/`pointerup` `PointerEvent`s on Terra Draw's own overlay element
(`div[style*="z-index: 3;"]`, matched from the adapter's `getMapEventElement()`) —
the actual event types and element its Google Maps adapter listens on
(confirmed by reading `terra-draw`'s and `terra-draw-google-maps-adapter`'s
bundled source), so unlike calling `startDrawing()`/`stopDrawing()` alone,
this genuinely exercises the adapter's pointer-capture calls and lets a
`play()` function tell an armed-but-empty session apart from a real one.

- `GroupedEmptyArmDoesNotRecreateTerraDraw` (new) — Change 1's negative case:
  cycles arm/cancel twice with zero vertices placed, asserts the `TerraDraw`
  instance and `_terraDrawReady` are completely untouched both times.
- `GroupedRepeatedDrawCyclesRecreateTerraDraw` (rewritten) — Change 2: each
  of 4 cycles places one real vertex then cancels via `stopDrawing()`
  directly, asserting the instance has **already** swapped by the time that
  call returns (no wait) — the eager half, tested deterministically rather
  than via a fragile repeated-full-close loop (an earlier attempt at
  repeating `drawSquare()` 4x passed by hand against the dev server but was
  flakier under the test-runner's headless timing; kept to one full close at
  the end instead, and pushed the "several consecutive real draws" claim to
  the hand-verified check above, same as the story's original doc comment
  already conceded for the pre-existing mechanism).
- `GroupedEagerRecreateAvoidsSwallowedClick` (new) — direct regression test
  for the reported bug: replicates the cascade programmatically
  (`setEditMode`/`handleEscape`) then draws immediately via `drawSquare()`
  with no wait, asserting the new feature is selected and `editable: true`.

Hand-verified only, not automatable: genuine multi-click **mouse** input
against the browser's real pointer-capture semantics one step beyond what a
`play()`-dispatched synthetic `PointerEvent` can promise — covered by the
3-consecutive-real-draw check above, per `docs/superpowers/reports/escape-draw-cursor-report.md`'s
own prior precedent for this exact limitation.

## Five checks (verbatim tails, run against the committed state)

**`npm run lint`** — `✖ 48 problems (0 errors, 48 warnings)` (all
pre-existing `no-console`, none in touched files).

**`npm run test:ci`** — `Test Suites: 114 passed, 114 total` /
`Tests: 934 passed, 934 total`.

**`npm run build:ui-common`** — exit 0, `Built Angular Package`, no errors.

**`npm run build-storybook`** — exit 0, `Output directory: ...\storybook-static`
(only pre-existing bundle-size warnings and the cosmetic
`Error during CHANGELOG/LICENSE read`).

**`npm run test-storybook -- google-maps`** — run 3 times across the session
(once mid-fix to catch the flaky repeated-close story above, twice more
after rewriting it): `Test Suites: 1 passed, 1 total` /
`Tests: 28 passed, 28 total` on the final two runs. Storybook `:6007`
confirmed healthy (`curl` 200) before and after; not restarted.

## Commit

`d14e5163` — `fix(google-maps): narrow terra-draw#710 recreate to real draws, run it eagerly`
(one commit; Change 1 and Change 2 are inseparable — Change 2 exists only
because Change 1 alone would relocate the same swallowed-click race to a
session's second field, so splitting them would leave a broken intermediate
state).

---

# Original stop-and-report (preserved)

## The literal hypothesis was refuted
`stopDrawing()`'s `!this._terraDrawReady` guard never actually tripped in
either reported path. The real failure was one level over:
`startDrawing()`'s own identical guard dropped a *later* call made while an
*earlier* call's (lazy, at the time) recreate was still in flight — triggered
because `setEditMode(true)`'s F6 auto-arm made "enter edit mode with nothing
selected" start a real Terra Draw session, and the OLD, unnarrowed
`stopDrawing()` flagged *any* cancelled session (including one that placed
zero vertices) for recreation the same as a genuine multi-click draw.
