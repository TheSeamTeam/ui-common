# terra-draw#710 recovery spike

Branch: `marklb/map-interaction-improve`. **No code committed** — this is a
spike; the fix candidate found is not low-risk enough to ship without further
engineering and full-suite verification (see Cost below).

## What actually restores state (Task 1)

**It does not.** Verified live against a real Storybook session
(`GroupedDrawingStateReleasesAfterStop` story, real mouse clicks/drags, no
stubbing):

1. Reliably reproduced the stuck state with a fast, no-delay click sequence
   (`page.mouse.click` back-to-back, no waits) after ~15 successful draws —
   confirms the race is real but timing-sensitive; slow/deliberate synthetic
   clicks with pauses never reproduced it across 14 tries. `isDrawing()` was
   `true`, `getMode()` was `'polyline'`, and a subsequent drag **panned the
   map** instead of editing — matching the reported symptom exactly.
2. Called `stopDrawing()` alone: `isDrawing()`/`getMode()` flipped back to
   `false`/`'static'` — but a following real draw attempt got stuck again
   immediately (first click started a new draw fine, since that goes through
   our own `google.maps` `'click'` listener; every following click, which
   must land on Terra Draw's own adapter-level capture, was silently
   dropped).
3. Called `setEditMode(false)` then `setEditMode(true)` (the reported
   workaround): same result as #2 — flags reset, but the **next real draw
   attempt reproduced the identical stuck state**, and a drag still panned
   the map instead of drawing.

**Conclusion: the toggle does not fix anything upstream.** It only resets
this service's own bookkeeping (`_drawingSubject`, `setMode('static')`),
which was already unconditionally called by `stopDrawing()` — nothing new.
The earlier investigation's claim that the toggle "fully restores... and a
subsequent draw can proceed" only checked the flags, not a subsequent real
multi-click draw; that check is refuted here. This is neither time-based nor
render-based recovery — it is no recovery at all, just a state reset that
happens to look like one.

## Can the wrapper apply real recovery itself (Task 2)?

Tested the most invasive candidate: dispose and recreate the `TerraDraw`
instance and its adapter.

- Worked around the "already initialized" guard by nulling `_terraDraw`
  after calling `.stop()`, then re-running `_initTerraDraw()`.
- **This genuinely restores functionality**: the next real draw completed
  its full multi-click sequence cleanly (`isDrawing()` → `false`, `getMode()`
  → `'static'`, visible finished polygon), and panning afterward behaved
  correctly again.
- Read the adapter's `unregister()` (in
  `terra-draw-google-maps-adapter.modern.js`): it removes its listeners, sets
  its `OverlayView`'s map to `null`, and — critically for `isolatedData:
  true` — calls `this._data.setMap(null)` and drops the reference. So a
  single stop/recreate cycle does not leak or duplicate the isolated Data
  layer; screenshots after recreation showed no orphaned/duplicate layers.

The lighter candidates (re-running the toggle automatically, or
`stop()`+`start()` on the same instance without recreating the adapter)
were not separately tested beyond #2/#3 above, since both boil down to the
same no-op: they never touch the adapter's own dropped listeners/capture,
which is what's actually broken.

## Cost judgment (Task 3)

Recreating per draw is the only candidate that works, but it is not a
low-risk drop-in:
- `_initTerraDraw()`'s "already initialized" guard needs removing/adjusting.
- `draw.on('ready'/'finish', ...)` listeners are per-instance and must be
  re-wired on every recreation.
- Only a single recreate cycle was verified; repeated recreation every draw,
  over a long multi-field session, was not stress-tested for cumulative cost
  or subtler leaks (e.g. the `OverlayView`/style-sheet cursor override
  bookkeeping).
- Adds a teardown/rebuild on every successful draw in the main path (not just
  an error path), for a session that may involve many draws.

**Recommendation:** given the fix works but is unverified at production
quality (no automated test coverage, not run through lint/build/storybook-
test), treat this spike as confirming the workaround is real and buildable,
but implement and verify it as a follow-up task with full TDD and the five
checks — do not ship it from this spike.

## Upstream state

- Installed: `terra-draw@1.31.2`, `terra-draw-google-maps-adapter@1.6.1`
  (matches `package.json`'s `^1.31.2` / `^1.6.1`).
- Latest published: `terra-draw@1.33.0` (adapter unchanged at `1.6.1` — no
  new adapter release at all since we pinned).
- terra-draw#710 is **still open**, no fix or maintainer response beyond the
  original bug report.
- `terra-draw@1.33.0`'s changelog (fetched from GitHub releases) contains no
  entries mentioning the Google Maps adapter, pointer capture, or dragging —
  only ellipse mode, degree snapping, select/circle/freehand mode fixes, and
  chores. A version bump would not help today.

## Environment note

Playwright's Chrome channel was not installed in this environment (no admin
rights to install Google Chrome, and `npx playwright install chrome` failed
even under Node 22.12.0). Copied the already-downloaded Playwright Chromium
binary (`ms-playwright/chromium-1234/chrome-win64`) into the path Playwright
expects for the `chrome` channel
(`%LOCALAPPDATA%\Google\Chrome\Application`) to get a real browser session
for this spike. This is a genuine Chromium build (same engine, same pointer/
capture semantics), not a mock — the repro and findings above are from real
mouse events in a real rendered map, not stubbed.
