# File Input — Design Spec

**Date:** 2026-04-20
**Module:** `@theseam/ui-common/file-input` (new secondary entry point)

## Motivation

Every consumer app — most visibly `TheSeam.Sustainability.Cotton.App` — has accumulated near-duplicate 150–250 line components wrapping `ngx-file-drop` + a hidden native file input. Examples include `logo-input-control`, `register-logo-input`, `profile-logo`, `upload-shipment`, `upload-bales`, `upload-correction`, `modal-verifier-document`, and `climate-smart-grower-application-file-upload`. Each one re-implements: drop handling, native input wiring, click-to-browse, focus plumbing, size/type validation, error messaging, CVA, and the visual of a drop zone + selected-file display.

This spec defines a shared `file-input` module that replaces this boilerplate with a small set of composable primitives plus a composed form control.

## Decisions already made

| Decision | Value | Rationale |
| --- | --- | --- |
| DnD implementation | Native HTML5 (`DataTransfer.files`) | None of the existing call sites use `ngx-file-drop`'s recursive `FileSystemEntry` feature; the dependency is tax. |
| Multi-file support | Day one | Cheap to design in now, expensive to retrofit; `climate-smart-grower-application-file-upload` already uses multi. |
| Empty-state visual | V2 — dashed outline + circular white icon badge | Chosen from three directions; echoes the styling direction the project's designer has been moving toward without feeling disabled. |
| Row-tile visual | Outlined row (white bg, thin `#e9ecef` border) | Matches empty state; reads as distinct item on any background. |
| View-on-click | Opt-in | The tile is clickable only when `(itemClick)` is wired; default viewers vary too much across apps (encrypted assets, modals, new tab). |
| Single-file filled-state flow | "C-pattern" — tile replaces input, dashed "choose a different file" bar below | Makes the resolved state obvious; the dashed bar keeps a drop affordance visible. |
| Preview-variant filename | Shown, small and muted, below the thumbnail | Lightweight confirmation; can be hidden via `[showName]="false"`. |
| View button | Removed from the tile | Whole row clickable to view (when opt-in wired); remove X stops propagation. |
| Decomposition | Separate `<seam-file-input>` + `<seam-file-field>` + `<seam-file-tile>` + `[seamFileDropZone]` | State-ownership boundary: input primitive is stateless; field is stateful + CVA; tile is pure display; directive enables custom drop targets. |
| Magic-byte type detection via `file-type` | Deferred | Significant async/IO cost per drop; no current call site needs it. |

## Module layout

New secondary entry point at `projects/ui-common/file-input/`:

```
projects/ui-common/file-input/
  ng-package.json
  public-api.ts
  file-input.component.ts            # <seam-file-input>
  file-input.component.scss
  file-input.component.spec.ts
  file-input.stories.ts
  file-tile.component.ts             # <seam-file-tile>
  file-tile.component.scss
  file-tile.component.spec.ts
  file-tile.stories.ts
  file-field.component.ts            # <seam-file-field>
  file-field.component.scss
  file-field.component.spec.ts
  file-field.stories.ts
  file-drop-zone.directive.ts        # [seamFileDropZone]
  file-drop-zone.directive.spec.ts
  file-drop-zone.directive.stories.ts
  file-item.models.ts
  file-item.utils.ts
  file-item.utils.spec.ts
  testing/
    public-api.ts
    file-input.harness.ts
    file-tile.harness.ts
    file-field.harness.ts
    file-drop-zone.harness.ts
```

All components are standalone, use `ChangeDetectionStrategy.OnPush`, and use `inject()` for DI. Selectors use the `seam-` / `seam` prefix conventions; exported types use the `TheSeam` class-name prefix.

### Public API

From `projects/ui-common/file-input/public-api.ts`:

```ts
export { TheSeamFileInputComponent } from './file-input.component'
export { TheSeamFileTileComponent } from './file-tile.component'
export { TheSeamFileFieldComponent } from './file-field.component'
export { TheSeamFileDropZoneDirective } from './file-drop-zone.directive'
export {
  SeamFileItem,
  SeamFileItemSource,
  SeamFileRejection,
  SeamFileRejectionReason,
  SeamFileTileVariant,
} from './file-item.models'
export {
  seamFileItemFromFile,
  seamFileItemFromUrl,
  seamFilesFromItems,
  iconForMime,
} from './file-item.utils'
```

Harness entry point at `projects/ui-common/file-input/testing/public-api.ts` exports `TheSeamFileInputHarness`, `TheSeamFileTileHarness`, `TheSeamFileFieldHarness`, and `TheSeamFileDropZoneHarness`.

## Data model

```ts
// file-item.models.ts

export type SeamFileItemSource =
  | { kind: 'file'; file: File }
  | { kind: 'url'; url: string }
  | { kind: 'blob'; blob: Blob }

export interface SeamFileItem {
  /** Display name. */
  name: string
  /** Bytes. Known for File/Blob; optional for URL. */
  size?: number
  /** MIME type. Known for File/Blob; may be absent for URL. */
  type?: string
  /** Where the bytes (or the asset pointer) live. */
  source: SeamFileItemSource
  /** Consumer-supplied tracking key (e.g. documentId, syncId). */
  id?: string
  /** Override thumbnail URL. Otherwise derived for image sources. */
  thumbnailUrl?: string
}

export type SeamFileRejectionReason = 'type' | 'size' | 'count'

export interface SeamFileRejection {
  file: File
  reasons: SeamFileRejectionReason[]
}

export type SeamFileTileVariant = 'row' | 'preview'
```

### Utilities

```ts
// file-item.utils.ts

export function seamFileItemFromFile(file: File, id?: string): SeamFileItem

export function seamFileItemFromUrl(
  url: string,
  opts?: {
    name?: string           // defaults to the URL basename
    type?: string
    size?: number
    id?: string
    thumbnailUrl?: string
  },
): SeamFileItem

export function seamFilesFromItems(items: SeamFileItem[]): File[]
// Returns File blobs for items where source.kind === 'file'; ignores others.
// Intended for submit-side mapping when the consumer only cares about new uploads.

export function iconForMime(type: string | undefined): SeamIcon
// Returns a SeamIcon (IconProp | IconDefinition | string) from a small built-in map.
// Covers pdf, word, excel/csv, image, with a generic fallback.
// Returns SeamIcon rather than IconDefinition so the icon set can shift
// away from FontAwesome later without changing the public signature.
```

Deliberately out of scope for v1: upload progress, per-item errors persisting in the model, rich thumbnail generation for non-image types. These can be added without breaking the interface.

## `[seamFileDropZone]` directive

Attaches drop-zone behavior to any element. The directive owns the drop wiring; `<seam-file-input>` delegates to it internally.

### Inputs

| Input | Type | Default | Purpose |
| --- | --- | --- | --- |
| `accept` | `string` | `''` | MIME/extension filter applied to dropped files (native-input `accept` is the input component's concern). |
| `maxSize` | `number \| null` | `null` | Per-file byte limit. |
| `maxFiles` | `number \| null` | `null` | Caps accepted count per drop; extras rejected with reason `'count'`. |
| `disabled` | `boolean` | `false` | Disables drop handling; no `.is-over` class is applied. |

### Outputs

| Output | Payload | When |
| --- | --- | --- |
| `seamFileDrop` | `File[]` | Files that passed validation on a drop. |
| `seamFileDropRejected` | `SeamFileRejection[]` | Files that failed validation on a drop. |

### Host behavior

- During drag-over, the host element gets class `seam-file-drop-zone--over`. Counter-based tracking of `dragenter`/`dragleave` on descendants avoids flicker.
- `dragover` is `preventDefault`'d so the drop event fires.
- `drop` reads `DataTransfer.files`, validates, emits. Validation order: type → size → count. Each rejected file's `reasons` array contains all failures (not short-circuited).

## `<seam-file-input>` (stateless drop/click zone)

Visual drop zone with click-to-browse and integrated hidden native input. Emits new files. **Not a ControlValueAccessor.**

### Inputs

| Input | Type | Default | Purpose |
| --- | --- | --- | --- |
| `multiple` | `boolean` | `false` | Native `multiple` attribute on hidden input; also informs multi-drop handling. |
| `accept` | `string` | `''` | Forwarded to native `<input accept>` and to the drop-zone directive. |
| `maxSize` | `number \| null` | `null` | Per-file byte limit. |
| `maxFiles` | `number \| null` | `null` | Multi mode only; caps total files accepted per interaction. |
| `disabled` | `boolean` | `false` | Blocks click + drop; styled as non-interactive. |
| `hideErrors` | `boolean` | `false` | Suppresses the built-in inline error line. |
| `promptText` | `string` | `'Choose a file'` | Bold portion of the prompt. |
| `promptSuffix` | `string` | `'or drag it here'` | Trailing prompt copy. |

### Outputs

| Output | Payload | When |
| --- | --- | --- |
| `filesAdded` | `File[]` | After validation, on drop or native-input change. |
| `rejected` | `SeamFileRejection[]` | Any file that failed validation. |

### Template shape

```html
<div class="seam-file-input__zone"
     [seamFileDropZone]
     [accept]="accept"
     [maxSize]="maxSize"
     [maxFiles]="maxFiles"
     [disabled]="disabled"
     (seamFileDrop)="_onFilesAdded($event)"
     (seamFileDropRejected)="_onRejected($event)"
     role="button"
     [attr.tabindex]="disabled ? -1 : 0"
     (click)="_openPicker()"
     (keydown.enter)="_openPicker(); $event.preventDefault()"
     (keydown.space)="_openPicker(); $event.preventDefault()">
  <span class="seam-file-input__icon">
    <seam-icon [icon]="faUpload" />
  </span>
  <p class="seam-file-input__prompt">
    <strong>{{ promptText }}</strong> {{ promptSuffix }}
  </p>
</div>
<input type="file" hidden #native
       [multiple]="multiple"
       [accept]="accept"
       (change)="_onNativeChange($event)" />
@if (!hideErrors && _errors()?.length) {
  <p class="seam-file-input__errors">{{ _errorMessage() }}</p>
}
```

Replaces the existing "invisible card" wrapper + `@HostBinding('attr.tabIndex') = -1` + `@HostListener('focus')` pattern. The interactive zone is the drop-zone element; the component host is not focusable.

### Built-in error line

When a drop/selection produces rejections, the component renders a single-line message summarizing the most recent rejection batch. Messages:

- `'type'`: `"File type not accepted."`
- `'size'`: `"File exceeds the maximum size ({N} MB)."` (size formatted using a small helper)
- `'count'`: `"Only {N} file(s) can be added."`

Message mixing (multiple reasons across files) collapses to the first reason that applies. Consumers that want full control set `[hideErrors]="true"` and subscribe to `(rejected)`.

## `<seam-file-tile>` (item renderer)

Renders one `SeamFileItem` in row or preview variant. No file-input dependency. No CVA.

### Inputs

| Input | Type | Default | Purpose |
| --- | --- | --- | --- |
| `item` | `SeamFileItem` | *(required)* | The item to render. |
| `variant` | `SeamFileTileVariant` | `'row'` | Row = list item; preview = thumbnail tile. |
| `showName` | `boolean` | `true` | Preview variant: toggle filename visibility. |
| `showMeta` | `boolean` | `true` | Row variant: toggle size/mime meta line. |
| `removable` | `boolean` | `true` | Show the remove X button. |
| `disabled` | `boolean` | `false` | Hides remove button; disables click behavior. |

### Outputs

| Output | Payload | When |
| --- | --- | --- |
| `itemClick` | `SeamFileItem` | User clicks the tile body. Fires only when subscribed. |
| `remove` | `SeamFileItem` | User clicks the remove X. Stops propagation from `itemClick`. |

### Opt-in click behavior

On init (and whenever the output subscription changes), the component reads `itemClick.observed`. When `observed === true`, the tile body gets `role="button"`, `tabindex="0"`, cursor pointer, and a subtle hover background. When `false`, the tile body has no interactive affordances (no cursor change, no hover, no role). This prevents misleading the user with a clickable look that does nothing.

### Visual-slot logic (internal)

1. If `item.thumbnailUrl` present → use as `<img src>`.
2. Else if `item.source.kind` is `'file'` or `'blob'` and `item.type` starts with `image/` → create an object URL on demand, revoked on destroy or `item` change.
3. Else if `item.source.kind === 'url'` and (`item.type` starts with `image/` OR URL extension is image-like) → use the URL directly.
4. Else → icon from `iconForMime(item.type)` rendered via `<seam-icon>`.

Object URLs created internally are tracked and revoked; there is no memory-leak surface from tile re-rendering.

### Visual details

- **Row variant:** 36×36 visual slot, name (ellipsis-truncated), optional meta line (`"1.2 MB · image/png"`), remove X on right. Rounded 6px, 1px `#e9ecef` border, white bg.
- **Preview variant:** Aspect-preserving thumbnail, small muted filename below (when `showName`), remove X overlaid top-right as a 22px semi-transparent dark circle (hover → danger red).

## `<seam-file-field>` (form control)

Composes input + tiles with the C-pattern flow. Implements `ControlValueAccessor`.

### CVA value

`SeamFileItem[]`

- On `writeValue(items)`: accepts any mix of `file` / `url` / `blob` source items. Used for edit forms with pre-existing server-hosted files.
- When the user adds files via the picker/drop: each `File` is wrapped via `seamFileItemFromFile` and appended.
- When the user removes a tile: the item is spliced out of the value.
- The CVA value is always the full "what's in this field" — form model and UI stay in sync.

### Inputs

| Input | Type | Default | Purpose |
| --- | --- | --- | --- |
| `multiple` | `boolean` | `false` | Single- vs multi-file mode. |
| `accept` | `string` | `''` | Forwarded to `<seam-file-input>`. |
| `maxSize` | `number \| null` | `null` | Forwarded. |
| `maxFiles` | `number \| null` | `null` | Forwarded. In multi mode, the field also caps additions so the CVA value never exceeds this. |
| `disabled` | `boolean` | `false` | Forwarded; disables CVA. Also honored by `setDisabledState()`. |
| `previewMode` | `boolean` | `false` | Renders tiles as `variant="preview"`. |
| `showTileName` | `boolean` | `true` | Forwarded to tile `showName` in preview mode. |
| `promptText` | `string` | `'Choose a file'` | Forwarded. |
| `promptSuffix` | `string` | `'or drag it here'` | Forwarded. |
| `replaceText` | `string` | `'choose a different file'` | Copy in the single-file replace bar. |
| `hideErrors` | `boolean` | `false` | Forwarded. |

### Outputs

| Output | Payload | When |
| --- | --- | --- |
| `rejected` | `SeamFileRejection[]` | Forwarded from the embedded input. |

No `(itemClick)` output. Consumers that want custom view behavior compose `<seam-file-input>` + `<seam-file-tile>` directly.

### Template shape

```html
@if (!multiple && _hasFile()) {
  <seam-file-tile
    [item]="_items()[0]"
    [variant]="previewMode ? 'preview' : 'row'"
    [showName]="showTileName"
    (remove)="_onRemove($event)" />
  <button type="button" class="seam-file-field__replace" (click)="_openPicker()">
    or <strong>{{ replaceText }}</strong>
  </button>
} @else {
  <seam-file-input
    #input
    [multiple]="multiple"
    [accept]="accept"
    [maxSize]="maxSize"
    [maxFiles]="_remainingMaxFiles()"
    [disabled]="disabled"
    [hideErrors]="hideErrors"
    [promptText]="promptText"
    [promptSuffix]="promptSuffix"
    (filesAdded)="_onFilesAdded($event)"
    (rejected)="rejected.emit($event)" />

  @if (multiple && _items().length) {
    <div class="seam-file-field__tiles" [class.seam-file-field__tiles--preview]="previewMode">
      @for (item of _items(); track item.id ?? item.name) {
        <seam-file-tile
          [item]="item"
          [variant]="previewMode ? 'preview' : 'row'"
          [showName]="showTileName"
          (remove)="_onRemove($event)" />
      }
    </div>
  }
}
```

### Multi-mode layout

- `previewMode=false` → tiles stack vertically (`flex-direction: column`, 6px gap).
- `previewMode=true` → tiles wrap horizontally (`flex-wrap: wrap`, 8px gap).

### What the field intentionally does NOT do

- Expose `(itemClick)`. Custom view = compose primitives directly.
- Handle uploads, progress, or server responses.
- Manage per-item error state beyond the drop-time `(rejected)` output.

## Migration

The library PR ships the new module, migrates the one in-library consumer, and removes `ngx-file-drop` from the library's dependencies. Apps are untouched in the same PR.

### In the library PR

1. Build new module per this spec.
2. Migrate `projects/ui-common/signature-input/signature-input-img/signature-input-img.component.*` from `ngx-file-drop` to `[seamFileDropZone]`. The existing `<div class="seam-signature-input-img__upload-box">` becomes the drop-zone host; the hidden `<input type="file">` is added directly (not nested inside an `ngx-file-drop` template); the signature preview via `background-image` stays; the external clear button stays.
3. Remove `ngx-file-drop` from `projects/ui-common/package.json` dependencies.
4. Remove `NgxFileDropModule` imports / `ngx-file-drop` usages from the library.
5. Verify no remaining library references: `grep -r "ngx-file-drop" projects/ui-common` returns nothing.

### App migration (future, per-app, one call site per PR)

Order designed to smoke-test the API on simple cases before using the primitives in the complex one:

1. `logo-input-control` — single-file image CVA. First API exercise.
2. `register-logo-input` — structural duplicate of #1.
3. `profile-logo` — mixed edit-form case; exercises `seamFileItemFromUrl`.
4. `upload-shipment`, `upload-bales`, `upload-correction` — single-file with server upload submit flow; mostly boilerplate deletion.
5. `modal-verifier-document` — same pattern as #4.
6. `climate-smart-grower-application-file-upload` — FormArray, mixed pending/server-hosted items. Uses `<seam-file-input>` + `<seam-file-tile>` primitives directly. Validates the primitives work in anger.

When #6 lands, `ngx-file-drop` can be removed from the consuming app's `package.json`.

## Testing

### Jest specs

Add `file-input` to the enabled directories in `projects/ui-common/jest.config.ts`.

- `file-item.utils.spec.ts` — `seamFileItemFromFile`, `seamFileItemFromUrl`, `seamFilesFromItems`, `iconForMime` (including the fallback path and extension-only sniffing in `seamFileItemFromUrl`).
- `file-drop-zone.directive.spec.ts` — dragenter/dragleave counter behavior, `preventDefault` on dragover, drop validation (type/size/count), `is-over` class lifecycle, disabled state.
- `file-input.component.spec.ts` — click opens picker, drop emits files, rejection emission, disabled blocks all interaction, error line renders/hides correctly.
- `file-tile.component.spec.ts` — variant switching, object-URL creation + revocation (inspect `URL.createObjectURL` / `URL.revokeObjectURL` call counts via spies), opt-in click via `itemClick.observed`, remove event, mime-icon fallback.
- `file-field.component.spec.ts` — `writeValue` with mixed sources, `registerOnChange`/`registerOnTouched`/`setDisabledState`, C-pattern flow in single mode, multi accumulation, removal, `maxFiles` respected during subsequent drops, `(rejected)` pass-through.

### CDK harnesses

Each harness is usable in both TestBed and Storybook test-runner contexts.

- `TheSeamFileInputHarness` — `dropFiles(files)`, `selectFiles(files)` (simulates native input change), `getPromptText()`, `isDisabled()`, `getErrorMessage()`.
- `TheSeamFileTileHarness` — `getName()`, `getVariant()`, `isClickable()`, `click()`, `clickRemove()`.
- `TheSeamFileFieldHarness` — delegates: `getTiles(): Promise<TheSeamFileTileHarness[]>`, `getInputHarness(): Promise<TheSeamFileInputHarness | null>` (null in single-mode filled state), `getReplaceButtonText()`.
- `TheSeamFileDropZoneHarness` — `dropFiles(files)`, `isOver()`.

### Storybook stories (CSF 3)

Stories serve as the primary usage documentation (per project convention).

**`<seam-file-input>`:**
- `Default`
- `Multiple`
- `WithAcceptFilter` — `accept="image/*"`
- `WithMaxSize` — exercises rejection
- `WithMaxFiles`
- `Disabled`
- `HiddenErrors` — consumer renders errors elsewhere

**`<seam-file-tile>`:**
- `RowVariant` — image thumbnail, PDF mime icon, long truncated filename
- `RowVariantNoMeta`
- `PreviewVariant` — with filename
- `PreviewVariantNoName` — image-only
- `ClickableTile` — `(itemClick)` wired
- `NonRemovable`
- `UrlSourceItem` — pre-existing server-hosted item

**`<seam-file-field>`:**
- `SingleFile` — C-pattern flow
- `SingleFilePreview`
- `MultipleFiles`
- `MultipleFilesPreview` — wrapping tiles
- `MultipleFilesPreviewWithMaxFiles` — exercises `count` rejection
- `EditFormWithExistingUrl` — pre-filled via `seamFileItemFromUrl`
- `WithValidation` — accept + maxSize, rejection visible
- `FormControl` — reactive forms
- `Disabled`
- `CustomStateWithInputAndTile` — climate-smart-grower-style, no field

**`[seamFileDropZone]`:**
- `BasicUsage` — directive on a plain `<div>`
- `LargeDropZone` — directive on a full-page container

Play functions cover interactive cases (drop simulation, click-to-replace, remove). Run by `npm run test-storybook`.

## Deferred to future work

Not built in v1. Can be added without breaking the v1 API.

- `<seam-file-list>` — thin wrapper for `*ngFor` over tiles. No abstraction earned yet.
- Magic-byte type detection via `file-type` — opt-in input like `[typeDetection]="'bytes'"`. No current call site needs it.
- Upload progress / async upload state — orthogonal concern; a wrapper or parallel state, not a fold into `SeamFileItem`.
- DI token for customizing the built-in mime-icon map.
- A "big drop zone" convenience directive that binds a non-adjacent drop target to a specific `<seam-file-input>` or `<seam-file-field>` (the directive alone is enough for v1; a service layer is only needed if multiple call sites need it).
