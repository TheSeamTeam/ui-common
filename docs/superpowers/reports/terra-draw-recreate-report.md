# terra-draw#710 recovery: dispose + recreate implementation

Branch: `marklb/map-interaction-improve`. Implements the spike's recommended
fix (`docs/superpowers/reports/terra-draw-710-spike.md`): dispose and recreate the
`TerraDraw` instance and its Google Maps adapter to recover from the upstream
adapter-level pointer-capture loss (terra-draw#710).

## What changed

`projects/ui-common/google-maps/google-maps.service.ts`:

- `_initTerraDraw()` keeps its "already initialized" throw-guard (protects
  against a genuine accidental double-init at startup) but now delegates
  instance construction to a new `_createTerraDraw(): TerraDraw`, which holds
  the old body (adapter, modes, `ready`/`finish` listeners) and returns the
  instance instead of assigning it directly — so it can be called again later
  with no guard in the way.
- `_disposeTerraDraw()` stops the current instance (`TerraDraw#stop()`
  deregisters its adapter, which for `isolatedData: true` calls
  `this._data.setMap(null)` and drops the reference) and clears
  `_terraDraw`/`_terraDrawReady`.
- `_recreateTerraDraw()` = dispose + `_createTerraDraw()`. New listeners are
  wired fresh each call — no stale closures survive onto a dead instance.
- **When it recreates — lazily, at the next `startDrawing()`:**
  `stopDrawing()` sets a new flag, `_terraDrawNeedsRecreate`, whenever a real
  draw session just ended (`wasDrawing` was true) — covering both a finished
  AND a cancelled draw, since both exercise the adapter's pointer capture the
  same way. The recreate itself doesn't run until the next `startDrawing()`
  consumes that flag, so a session that never draws again pays nothing, and
  finishing a draw is never followed by a visible stall.
- **The async-ready race:** recreation is synchronous but the new instance's
  `ready` event fires asynchronously (next tick). `startDrawing()` sets
  `_pendingStartDrawing` before kicking off the recreate and returns; the
  `ready` handler finishes entering drawing mode once the new instance is
  actually usable, re-checking `isEditingEnabled()`/`isDrawing()`/(grouped-only)
  `isEditMode()` in case something changed during the gap. The triggering
  click is queued, never silently dropped.

`projects/ui-common/google-maps/google-maps.stories.ts`: added
`GroupedRepeatedDrawCyclesRecreateTerraDraw`, which drives 4 consecutive
`startDrawing()`/`stopDrawing()` cycles and asserts `isDrawing()` reaches
`true` every time and the underlying `TerraDraw` instance is swapped on every
cycle after the first. This proves the wiring runs repeatedly with no stuck
state — it cannot exercise the real upstream pointer-capture defect itself,
since that only reproduces from real multi-click mouse input against the
adapter's own DOM listeners, which a programmatic `startDrawing()` call never
touches.

`public-api.ts`: not touched — nothing new is exported.

## Real-browser verification (the part that matters)

Against the live Storybook at `http://localhost:6007` (existing instance,
none started/stopped), using Playwright driving real `page.mouse` clicks —
not stubs, not synthetic DOM events. Used the `Basic` story, switched to
`interactionMode: 'grouped'` + edit mode via the service API (equivalent to
what the `[interactionMode]` input does), and manually programmed each
polygon's 4 corners plus a closing click computed from Terra Draw's own
`getSnapshot()` + the adapter's real map projection (avoids drift between
where a click lands and where Terra Draw thinks the first vertex is).

**Grouped mode, 5 consecutive real draws:** every one started, placed 4
real vertices, and closed on the first attempt. The underlying `TerraDraw`
instance's identity changed on every cycle after the first (proving recreate
actually ran, not a no-op), the map's feature count incremented by exactly 1
each time (0→1→2→3→4→5), and `isDrawing()` returned to `false` every time —
no stuck state at cycle 2, 3, 4, or 5. A drag after the 5th draw changed the
map's center (confirmed real panning, not the "drag pans instead of editing"
symptom).

**Data-layer leak check:** tagged and tracked the adapter's isolated `Data`
object across all 4 replaced instances from the run above. After the 5th
recreate, all 4 old `Data` objects reported `getMap() === false` (properly
detached) and only the current instance's `Data` was still attached
(`getMap() === true`) — no accumulation across multiple cycles, not just one.

**Legacy mode, 3 consecutive real draws:** same technique, using the
"Draw Field" button (legacy's actual toggle, not `setEditMode`). All 3
succeeded, with instance recreation confirmed on cycles 2 and 3 — the fix
helps legacy too, and its own single-cycle Storybook tests
(`LegacyDrawButtonTogglesDrawing`, `LegacyClickStillArmsEditing`, etc.) still
pass unmodified, confirming no observable-behavior change there.

One early false alarm, resolved: a first attempt using fixed re-click
coordinates for "closing" intermittently failed — traced to the very first
click of a fresh/recreated instance sometimes only arming drawing mode
without placing vertex 1 (an existing, pre-fix timing quirk in when our own
`click` listener vs. Terra Draw's own listener runs, unrelated to this fix).
Switching to computing the true closing pixel from Terra Draw's own snapshot
made every cycle reliable. Not a regression — the vertex count still ended
up correct (4 real vertices per polygon) either way.

## Verification: five checks (all run on this branch, in order)

**`npm run lint`** — pass, 0 errors, 48 pre-existing `no-console` warnings
(none in touched files).

**`npm run test:ci`** — pass, 114 suites, 928 tests.

**`npm run build:ui-common`** — pass, exit 0, `google-maps` entry point built
cleanly (only pre-existing Sass `@import` deprecation warnings, unrelated).

**`npm run build-storybook`** — pass, exit 0 (only pre-existing bundle-size
warnings, unrelated to these changes).

**`npm run test-storybook -- google-maps`** — pass, 23/23 tests, including
the new `GroupedRepeatedDrawCyclesRecreateTerraDraw` story.

## What remains manual-only

The real upstream pointer-capture defect (terra-draw#710) only reproduces
from genuine multi-click mouse input hitting the adapter's own DOM-level
listeners. No automated story can exercise that path (Terra Draw has no
map-level event to trigger synthetically for it), so the "does a second real
draw actually still work" question stays a manual, real-browser check —
done above, 5 times in grouped mode and 3 in legacy, not just once.
