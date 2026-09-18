# DataFilterToggleButtons Collapse Detection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `ResizeObserver`-based collapse detection to `DataFilterToggleButtonsComponent` so it exposes a `_isCollapsed` boolean when the button group would overflow its container (or exceed `maxWidth`).

**Architecture:** A hidden measurement div always renders the full button group off-screen, giving a stable `scrollWidth` reference even when the visible group is swapped out. A `ResizeObserver` on the host element recalculates the threshold on every resize and on `buttons` input changes. Zone.js patches `ResizeObserver`, so no manual `markForCheck()` is needed.

**Tech Stack:** Angular 20, TypeScript, `ResizeObserver` (native browser API), ng-packagr secondary entry points.

---

### Task 1: Add `maxWidth` to the options interface and defaults

**Files:**
- Modify: `projects/ui-common/data-filters/filters/data-filter-toggle-buttons/data-filter-toggle-buttons.component.ts`

- [ ] **Step 1: Add `maxWidth` to `IToggleButtonsFilterOptions`**

In `data-filter-toggle-buttons.component.ts`, update the interface and defaults:

```typescript
export interface IToggleButtonsFilterOptions extends ITextFilterOptions {
  selectionToggleable: boolean
  multiple: boolean
  buttons: IToggleButton[]
  initialValue?: any
  maxWidth?: number
}

export const DefaultToggleButtonsFilterOptions: IToggleButtonsFilterOptions = {
  properties: undefined,
  omitProperties: undefined,
  multiple: false,
  selectionToggleable: false,
  buttons: [],
  exact: false,
  caseSensitive: false,
  maxWidth: undefined,
}
```

- [ ] **Step 2: Add `maxWidth` as an `@Input()` on the component class**

Inside the `DataFilterToggleButtonsComponent` class body, alongside the other `@Input()` declarations:

```typescript
@Input() maxWidth = this._optDefault('maxWidth')
```

- [ ] **Step 3: Include `maxWidth` in the `options` getter**

```typescript
get options(): IToggleButtonsFilterOptions {
  return {
    properties: this.properties,
    omitProperties: this.omitProperties,
    multiple: this.multiple,
    selectionToggleable: this.selectionToggleable,
    buttons: this.buttons,
    exact: this.exact,
    caseSensitive: this.caseSensitive,
    maxWidth: this.maxWidth,
  }
}
```

- [ ] **Step 4: Run lint to confirm no errors**

```powershell
npm run lint
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```powershell
git add projects/ui-common/data-filters/filters/data-filter-toggle-buttons/data-filter-toggle-buttons.component.ts
git commit -m "feat(data-filters): add maxWidth option to IToggleButtonsFilterOptions"
```

---

### Task 2: Add measurement div styles to component SCSS

**Files:**
- Modify: `projects/ui-common/data-filters/filters/data-filter-toggle-buttons/data-filter-toggle-buttons.component.scss`

- [ ] **Step 1: Write the styles**

Replace the (empty) file contents with:

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

`:host { position: relative }` keeps the measurement div within the component's stacking context so it doesn't bleed into the page layout.

`.btn-group--measure` is off-screen and invisible but still participates in layout, so `scrollWidth` is accurate.

- [ ] **Step 2: Commit**

```powershell
git add projects/ui-common/data-filters/filters/data-filter-toggle-buttons/data-filter-toggle-buttons.component.scss
git commit -m "feat(data-filters): add measurement div styles for collapse detection"
```

---

### Task 3: Add measurement div to template

**Files:**
- Modify: `projects/ui-common/data-filters/filters/data-filter-toggle-buttons/data-filter-toggle-buttons.component.html`

- [ ] **Step 1: Add the hidden measurement div**

The measurement div must always be in the DOM (no `*ngIf`) so `scrollWidth` is always available. It renders the same buttons but without any toggle-group directives or event bindings.

Replace the template with:

```html
<div
  class="btn-group"
  role="group"
  aria-label="Progress Filter"
  *ngIf="options as opts"
  [formControl]="_control"
  seamToggleGroup
  [multiple]="opts.multiple"
  [selectionToggleable]="opts.selectionToggleable"
>
  <ng-container *ngFor="let btn of buttons">
    <button
      type="button"
      class="btn btn-sm px-4"
      [seamToggleGroupOption]="btn.value"
      #opt="seamToggleGroupOption"
      [class.btn-lightgray]="!opt.selected"
      [class.btn-primary]="opt.selected"
      (click)="opt.selected = !opt.selected"
    >
      {{ btn.name || btn.value }}
    </button>
  </ng-container>
</div>

<!-- Hidden measurement div: always in DOM, used to read natural btn-group width -->
<div #measureDiv class="btn-group btn-group--measure" aria-hidden="true">
  <ng-container *ngFor="let btn of buttons">
    <button type="button" class="btn btn-sm px-4" tabindex="-1">
      {{ btn.name || btn.value }}
    </button>
  </ng-container>
</div>
```

`#measureDiv` is the template reference used in the component class (next task). `aria-hidden="true"` hides it from screen readers. `tabindex="-1"` on each button prevents focus reaching the hidden buttons.

- [ ] **Step 2: Commit**

```powershell
git add projects/ui-common/data-filters/filters/data-filter-toggle-buttons/data-filter-toggle-buttons.component.html
git commit -m "feat(data-filters): add hidden measurement div to toggle buttons template"
```

---

### Task 4: Add ResizeObserver and `_isCollapsed` to the component class

**Files:**
- Modify: `projects/ui-common/data-filters/filters/data-filter-toggle-buttons/data-filter-toggle-buttons.component.ts`

- [ ] **Step 1: Update imports**

Add `AfterViewInit`, `ElementRef`, `OnChanges`, `SimpleChanges`, `ViewChild` to the Angular core imports, and add `inject` and `ChangeDetectorRef` if not already present. The full import block should be:

```typescript
import { coerceArray } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  inject,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { hasProperty, isNullOrUndefined } from '@theseam/ui-common/utils'

import {
  DataFilterState,
  IDataFilter,
  THESEAM_DATA_FILTER,
  THESEAM_DATA_FILTER_OPTIONS,
} from '../../data-filter'
import { THESEAM_DATA_FILTER_CONTAINER } from '../../data-filter-container'
import type { DataFilterContainer } from '../../data-filter-container'
import { textDataFilter } from '../data-filter-text/data-filter-text.component'
import { ITextFilterOptions } from '../data-filter-text/text-filter-options'
```

Note: the `tap` import is removed since the only remaining use was in commented-out lines.

- [ ] **Step 2: Add `_isCollapsed`, `_measureDiv`, `_hostEl`, `_resizeObserver` to the class**

Add these members to `DataFilterToggleButtonsComponent`, after the existing `@Input()` declarations:

```typescript
_isCollapsed = false

@ViewChild('measureDiv') private _measureDiv!: ElementRef<HTMLElement>

private readonly _hostEl = inject(ElementRef<HTMLElement>)
private _resizeObserver: ResizeObserver | undefined
```

- [ ] **Step 3: Add `_updateCollapsed()` method**

Add this private method to the class:

```typescript
private _updateCollapsed(): void {
  const measureWidth = this._measureDiv.nativeElement.scrollWidth
  const clientWidth = this._hostEl.nativeElement.clientWidth
  const threshold =
    this.maxWidth != null
      ? Math.min(clientWidth, this.maxWidth)
      : clientWidth
  this._isCollapsed = measureWidth >= threshold
}
```

- [ ] **Step 4: Implement `AfterViewInit` and wire up the observer**

Add `AfterViewInit` to the `implements` clause and add the lifecycle hook:

```typescript
export class DataFilterToggleButtonsComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit, IDataFilter
{
  // ...existing members...

  ngAfterViewInit(): void {
    this._resizeObserver = new ResizeObserver(() => this._updateCollapsed())
    this._resizeObserver.observe(this._hostEl.nativeElement)
  }
```

- [ ] **Step 5: Handle `buttons` input changes via `ngOnChanges`**

Add `OnChanges` to the `implements` clause and add:

```typescript
ngOnChanges(changes: SimpleChanges): void {
  if (changes['buttons'] && !changes['buttons'].firstChange) {
    this._updateCollapsed()
  }
}
```

This handles the case where `buttons` changes while the component is already in collapsed mode — the `ResizeObserver` won't fire (host width didn't change), but the measurement div's `scrollWidth` will have updated on the next CD cycle, so calling `_updateCollapsed()` here picks it up.

- [ ] **Step 6: Disconnect the observer in `ngOnDestroy`**

Update the existing `ngOnDestroy`:

```typescript
ngOnDestroy(): void {
  this._filterContainer.removeFilter(this)
  this._resizeObserver?.disconnect()
}
```

- [ ] **Step 7: Run lint**

```powershell
npm run lint
```

Expected: no errors.

- [ ] **Step 8: Run tests**

```powershell
npm run test:ci -- --testPathPattern="data-filter"
```

Expected: all pass (no existing tests for this component, so this just confirms nothing in the suite is broken).

- [ ] **Step 9: Commit**

```powershell
git add projects/ui-common/data-filters/filters/data-filter-toggle-buttons/data-filter-toggle-buttons.component.ts
git commit -m "feat(data-filters): add ResizeObserver collapse detection to toggle buttons"
```

---

### Task 5: Verify in Storybook

**Files:** No code changes — observation only.

The goal is to confirm `_isCollapsed` flips correctly as the container is resized.

- [ ] **Step 1: Open the data-filters story in Storybook**

If Storybook isn't running, start it:

```powershell
npm run storybook
```

Navigate to the `DataFilterToggleButtons` story. If none exists, open any story that uses the component, or create a minimal one-off story temporarily.

- [ ] **Step 2: Inspect `_isCollapsed` via browser devtools**

Open devtools, select the `seam-data-filter-toggle-buttons` element, and in the Angular devtools panel (or console via `ng.getComponent($0)`) observe `_isCollapsed`.

Resize the story panel (or the browser window) to be narrower than the button group. Confirm `_isCollapsed` becomes `true`. Widen it again — confirm it returns to `false`.

- [ ] **Step 3: Test `maxWidth`**

If there is a Storybook control for `maxWidth`, set it to a value smaller than the container width. Confirm `_isCollapsed` becomes `true` immediately regardless of container size.

If no control exists yet, this will be wired up when the dropdown UI is implemented in the follow-up.
