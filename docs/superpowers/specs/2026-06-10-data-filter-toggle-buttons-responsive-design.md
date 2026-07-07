# DataFilterToggleButtonsComponent — Responsive Collapse Detection

**Date:** 2026-06-10
**Scope:** Add container-aware collapse detection to `DataFilterToggleButtonsComponent` using `ResizeObserver` and a hidden measurement div. Produces a `_isCollapsed` boolean that downstream layout work can consume.

---

## Goal

Switch the toggle button group to a collapsed state when the natural width of the `.btn-group` would overflow its container. Support an optional `maxWidth` cap that can trigger collapse even earlier.

This spec covers detection only. What the collapsed state renders (e.g., a dropdown) is a follow-up.

---

## New Option: `maxWidth`

Add `maxWidth?: number` (pixels) to `IToggleButtonsFilterOptions` and `DefaultToggleButtonsFilterOptions` (default: `undefined`).

Exposed as an `@Input()` on the component with the existing `_optDefault()` pattern.

---

## Hidden Measurement Div

A second `.btn-group` div is always present in the template. It renders the same buttons as the visible group but is never interactive. Its sole purpose is to report the natural (unconstrained) width of the button set.

**Template:** Same `*ngFor` over `buttons`, same button markup, but no `seamToggleGroup` / `seamToggleGroupOption` directives, no event bindings. Add class `btn-group--measure`.

**CSS (component SCSS):**

```scss
:host {
  position: relative;
}

.btn-group--measure {
  visibility: hidden;
  position: absolute;
  pointer-events: none;
  white-space: nowrap;
  top: 0;
  left: -9999px;
}
```

`position: relative` on `:host` keeps the measurement div within the component's stacking context.

Because this div is always in the DOM, Angular keeps it updated whenever `buttons` changes — no `ngOnChanges` hook required.

---

## ResizeObserver + Collapse Logic

### New members

| Member | Type | Purpose |
|--------|------|---------|
| `_isCollapsed` | `boolean` | Whether the group should collapse |
| `_measureDiv` | `ElementRef` (`@ViewChild`) | Reference to `.btn-group--measure` |
| `_resizeObserver` | `ResizeObserver` | Observes the host element |

Inject `ElementRef` via `inject()`. No `ChangeDetectorRef` needed — the component uses `ChangeDetectionStrategy.Default` and zone.js patches `ResizeObserver`, so callbacks fire inside the Angular zone and change detection runs automatically.

### Lifecycle

**`ngAfterViewInit`:**
```
_resizeObserver = new ResizeObserver(() => _updateCollapsed())
_resizeObserver.observe(hostEl.nativeElement)
```

**`ngOnDestroy`** (existing): add `_resizeObserver.disconnect()`.

### `_updateCollapsed()` algorithm

```
measureWidth = _measureDiv.nativeElement.scrollWidth
clientWidth  = hostEl.nativeElement.clientWidth
threshold    = maxWidth != null
                 ? Math.min(clientWidth, maxWidth)
                 : clientWidth
_isCollapsed = measureWidth >= threshold
```

### Edge cases

- **Buttons change while collapsed:** The measurement div re-renders automatically on the next change detection pass. The ResizeObserver fires on the host element resize, but a button-set change that doesn't resize the host won't re-trigger the observer. To handle this, call `_updateCollapsed()` inside `ngOnChanges` when the `buttons` input changes.
- **Zero clientWidth on init:** Can occur if the host is hidden. `_isCollapsed` stays `false` until the observer fires with a real size — acceptable default.

---

## What This Does Not Cover

- What the collapsed state renders (dropdown UI, selected label, etc.) — follow-up spec.
- Accessibility for the collapsed state.
- Animation between states.
