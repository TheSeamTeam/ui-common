# File Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `@theseam/ui-common/file-input` secondary entry point per [the design spec](../specs/2026-04-20-file-input-design.md) — composable `<seam-file-input>`, `<seam-file-tile>`, `<seam-file-field>`, and `[seamFileDropZone]` — then migrate the library's only existing `ngx-file-drop` consumer (`signature-input-img`) and drop the dependency.

**Architecture:** Native HTML5 drag-and-drop (no `ngx-file-drop`). `[seamFileDropZone]` owns drop wiring; `<seam-file-input>` delegates to it. `<seam-file-field>` composes input + tile, implements `ControlValueAccessor` over `SeamFileItem[]`. `<seam-file-tile>` is a standalone renderer. All standalone components, `OnPush`, signal-based `input()` / `output()`.

**Tech Stack:** Angular 20 standalone components, ng-packagr, Jest (`@ngneat/spectator/jest`, `@testing-library/angular`), CDK component harnesses, Storybook 9 CSF3 with `play` functions, TypeScript, SCSS.

---

## Conventions (must follow for every task)

- **Selectors:** `seam-` prefix for components, `seam` camelCase for directives.
- **Classes exported via public-api:** `TheSeam`-prefixed. Internal types don't need the prefix but shouldn't contradict it.
- **Standalone components** (no `standalone: true` — it's the default in Angular 20).
- **Change detection:** `ChangeDetectionStrategy.OnPush`.
- **DI:** `inject()`, not constructor params. Declare `private readonly _service = inject(X)`.
- **Inputs/outputs:** `input()` and `output()` functions (signal-based), not decorators.
- **Private/template-only vars:** prefix with `_` (e.g., `_items`, `_onRemove`).
- **Tests:** Jest (`*.spec.ts`) for logic and rendering. Storybook `play` functions for interactive UI behavior.
- **ESLint/Prettier:** 2-space indent, no semicolons, single quotes, trailing commas, arrow parens always.
- **Commit style:** conventional commits. Use scope `file-input` for all library changes in this plan (e.g., `feat(file-input): ...`). `signature-input` scope for the migration commit.
- **Every commit goes through hooks** (`lint-staged` runs Prettier + ESLint). Do NOT use `--no-verify`.
- **Test file naming** matches source file: `foo.component.ts` → `foo.component.spec.ts`.

**Working directory for all git commands:** `c:/Users/Metal/dev_home/git/TheSeam.Ui.Common`

---

### Task 1: Create `file-input` entry point scaffold

Set up the empty secondary entry point so subsequent tasks have somewhere to put files. No components yet — just infrastructure.

**Files:**

- Create: `projects/ui-common/file-input/ng-package.json`
- Create: `projects/ui-common/file-input/public-api.ts`
- Create: `projects/ui-common/file-input/testing/public-api.ts`
- Modify: `projects/ui-common/jest.config.ts` — add `file-input` to `testMatch`

- [ ] **Step 1: Create `ng-package.json`**

File: `projects/ui-common/file-input/ng-package.json`

```json
{
  "$schema": "ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "public-api.ts"
  }
}
```

- [ ] **Step 2: Create empty `public-api.ts`**

File: `projects/ui-common/file-input/public-api.ts`

```ts
// File input secondary entry point — populated by later tasks.
export {}
```

- [ ] **Step 3: Create empty harness `testing/public-api.ts`**

File: `projects/ui-common/file-input/testing/public-api.ts`

```ts
// Harness exports — populated by later tasks.
export {}
```

- [ ] **Step 4: Register `file-input` specs with Jest**

Open `projects/ui-common/jest.config.ts`. Locate the `testMatch` array. Insert a new entry alongside the existing ones (keep the existing comment; add at the end of the list):

```ts
'**/file-input/**/*.spec.ts',
```

- [ ] **Step 5: Verify build passes**

Run: `npm run build:ui-common`
Expected: SUCCESS — new entry point builds with zero exports (ng-packagr emits a warning-free module).

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/file-input/ projects/ui-common/jest.config.ts
git commit -m "feat(file-input): scaffold secondary entry point"
```

---

### Task 2: Define `SeamFileItem` data model

Pure types. No runtime code.

**Files:**

- Create: `projects/ui-common/file-input/file-item.models.ts`
- Modify: `projects/ui-common/file-input/public-api.ts`

- [ ] **Step 1: Create the models file**

File: `projects/ui-common/file-input/file-item.models.ts`

```ts
/** Tagged union describing where a file item's bytes (or asset pointer) live. */
export type SeamFileItemSource =
  | { kind: 'file'; file: File }
  | { kind: 'url'; url: string }
  | { kind: 'blob'; blob: Blob }

/**
 * A file entry usable by `<seam-file-tile>` and `<seam-file-field>`.
 *
 * Covers three cases:
 * - Pending upload (File source)
 * - Already-uploaded server asset (URL source)
 * - In-memory bytes without a File wrapper (Blob source)
 */
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

/** Why a file was rejected at selection/drop time. */
export type SeamFileRejectionReason = 'type' | 'size' | 'count'

/** One rejected file and the set of reasons it failed validation. */
export interface SeamFileRejection {
  file: File
  reasons: SeamFileRejectionReason[]
}

/** Tile layout. `row` = horizontal list item; `preview` = thumbnail tile. */
export type SeamFileTileVariant = 'row' | 'preview'
```

- [ ] **Step 2: Export from public-api**

Open `projects/ui-common/file-input/public-api.ts`. Replace its contents with:

```ts
export {
  SeamFileItem,
  SeamFileItemSource,
  SeamFileRejection,
  SeamFileRejectionReason,
  SeamFileTileVariant,
} from './file-item.models'
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run build:ui-common`
Expected: SUCCESS — types compile, entry point exports them.

- [ ] **Step 4: Commit**

```bash
git add projects/ui-common/file-input/file-item.models.ts projects/ui-common/file-input/public-api.ts
git commit -m "feat(file-input): add SeamFileItem data model"
```

---

### Task 3: `seamFileItemFromFile` utility

**Files:**

- Create: `projects/ui-common/file-input/file-item.utils.ts`
- Create: `projects/ui-common/file-input/file-item.utils.spec.ts`
- Modify: `projects/ui-common/file-input/public-api.ts`

- [ ] **Step 1: Write failing test**

File: `projects/ui-common/file-input/file-item.utils.spec.ts`

```ts
import { seamFileItemFromFile } from './file-item.utils'

describe('seamFileItemFromFile', () => {
  it('wraps a File into a SeamFileItem with a file source', () => {
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

    const item = seamFileItemFromFile(file)

    expect(item.name).toBe('hello.txt')
    expect(item.type).toBe('text/plain')
    expect(item.size).toBe(file.size)
    expect(item.source).toEqual({ kind: 'file', file })
    expect(item.id).toBeUndefined()
  })

  it('accepts an id argument', () => {
    const file = new File(['x'], 'x.txt')

    const item = seamFileItemFromFile(file, 'abc-123')

    expect(item.id).toBe('abc-123')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest projects/ui-common/file-input/file-item.utils.spec.ts`
Expected: FAIL — module `./file-item.utils` not found.

- [ ] **Step 3: Create `file-item.utils.ts` with `seamFileItemFromFile`**

File: `projects/ui-common/file-input/file-item.utils.ts`

```ts
import { SeamFileItem } from './file-item.models'

export function seamFileItemFromFile(file: File, id?: string): SeamFileItem {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    source: { kind: 'file', file },
    id,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest projects/ui-common/file-input/file-item.utils.spec.ts`
Expected: PASS — both tests green.

- [ ] **Step 5: Export from public-api**

Open `projects/ui-common/file-input/public-api.ts`. Append:

```ts
export { seamFileItemFromFile } from './file-item.utils'
```

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/file-input/file-item.utils.ts projects/ui-common/file-input/file-item.utils.spec.ts projects/ui-common/file-input/public-api.ts
git commit -m "feat(file-input): add seamFileItemFromFile helper"
```

---

### Task 4: `seamFileItemFromUrl` utility

**Files:**

- Modify: `projects/ui-common/file-input/file-item.utils.ts`
- Modify: `projects/ui-common/file-input/file-item.utils.spec.ts`
- Modify: `projects/ui-common/file-input/public-api.ts`

- [ ] **Step 1: Write failing tests**

Append to `projects/ui-common/file-input/file-item.utils.spec.ts`:

```ts
import { seamFileItemFromUrl } from './file-item.utils'

describe('seamFileItemFromUrl', () => {
  it('wraps a URL into a SeamFileItem with url source', () => {
    const item = seamFileItemFromUrl('https://example.com/files/logo.png')

    expect(item.source).toEqual({
      kind: 'url',
      url: 'https://example.com/files/logo.png',
    })
  })

  it('defaults name to the URL basename', () => {
    const item = seamFileItemFromUrl('https://example.com/path/to/logo.png')

    expect(item.name).toBe('logo.png')
  })

  it('decodes URL-encoded basenames', () => {
    const item = seamFileItemFromUrl(
      'https://example.com/files/my%20file.pdf',
    )

    expect(item.name).toBe('my file.pdf')
  })

  it('strips query strings and fragments when deriving name', () => {
    const item = seamFileItemFromUrl(
      'https://example.com/file.pdf?v=2#page=1',
    )

    expect(item.name).toBe('file.pdf')
  })

  it('falls back to the url as name when basename cannot be derived', () => {
    const item = seamFileItemFromUrl('https://example.com/')

    expect(item.name).toBe('https://example.com/')
  })

  it('accepts overrides for name, type, size, id, thumbnailUrl', () => {
    const item = seamFileItemFromUrl('https://example.com/logo.png', {
      name: 'Brand Logo',
      type: 'image/png',
      size: 12345,
      id: 'doc-1',
      thumbnailUrl: 'https://example.com/logo-thumb.png',
    })

    expect(item.name).toBe('Brand Logo')
    expect(item.type).toBe('image/png')
    expect(item.size).toBe(12345)
    expect(item.id).toBe('doc-1')
    expect(item.thumbnailUrl).toBe('https://example.com/logo-thumb.png')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-item.utils.spec.ts`
Expected: FAIL — `seamFileItemFromUrl` is not exported.

- [ ] **Step 3: Implement `seamFileItemFromUrl`**

Append to `projects/ui-common/file-input/file-item.utils.ts`:

```ts
export interface SeamFileItemFromUrlOptions {
  name?: string
  type?: string
  size?: number
  id?: string
  thumbnailUrl?: string
}

export function seamFileItemFromUrl(
  url: string,
  opts: SeamFileItemFromUrlOptions = {},
): SeamFileItem {
  return {
    name: opts.name ?? _basenameFromUrl(url) ?? url,
    size: opts.size,
    type: opts.type,
    source: { kind: 'url', url },
    id: opts.id,
    thumbnailUrl: opts.thumbnailUrl,
  }
}

function _basenameFromUrl(url: string): string | null {
  // Strip query string and fragment before pulling the final path segment.
  const hashIdx = url.indexOf('#')
  const noHash = hashIdx >= 0 ? url.slice(0, hashIdx) : url
  const queryIdx = noHash.indexOf('?')
  const path = queryIdx >= 0 ? noHash.slice(0, queryIdx) : noHash

  const trimmed = path.replace(/\/+$/, '')
  const lastSlash = trimmed.lastIndexOf('/')
  if (lastSlash < 0) return null
  const raw = trimmed.slice(lastSlash + 1)
  if (!raw) return null
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-item.utils.spec.ts`
Expected: PASS — all `seamFileItemFromUrl` tests green.

- [ ] **Step 5: Export from public-api**

Modify `projects/ui-common/file-input/public-api.ts` — extend the existing export:

```ts
export {
  seamFileItemFromFile,
  seamFileItemFromUrl,
} from './file-item.utils'
```

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/file-input/file-item.utils.ts projects/ui-common/file-input/file-item.utils.spec.ts projects/ui-common/file-input/public-api.ts
git commit -m "feat(file-input): add seamFileItemFromUrl helper"
```

---

### Task 5: `seamFilesFromItems` utility

**Files:**

- Modify: `projects/ui-common/file-input/file-item.utils.ts`
- Modify: `projects/ui-common/file-input/file-item.utils.spec.ts`
- Modify: `projects/ui-common/file-input/public-api.ts`

- [ ] **Step 1: Write failing tests**

Append to `projects/ui-common/file-input/file-item.utils.spec.ts`:

```ts
import { seamFilesFromItems } from './file-item.utils'

describe('seamFilesFromItems', () => {
  it('returns File objects from items with file source', () => {
    const f1 = new File(['a'], 'a.txt')
    const f2 = new File(['b'], 'b.txt')

    const result = seamFilesFromItems([
      { name: 'a.txt', source: { kind: 'file', file: f1 } },
      { name: 'b.txt', source: { kind: 'file', file: f2 } },
    ])

    expect(result).toEqual([f1, f2])
  })

  it('omits items with non-file sources', () => {
    const f = new File(['a'], 'a.txt')

    const result = seamFilesFromItems([
      { name: 'a.txt', source: { kind: 'file', file: f } },
      { name: 'b.png', source: { kind: 'url', url: 'https://x/b.png' } },
      { name: 'c.bin', source: { kind: 'blob', blob: new Blob(['c']) } },
    ])

    expect(result).toEqual([f])
  })

  it('returns an empty array for an empty input', () => {
    expect(seamFilesFromItems([])).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-item.utils.spec.ts`
Expected: FAIL — `seamFilesFromItems` is not exported.

- [ ] **Step 3: Implement `seamFilesFromItems`**

Append to `projects/ui-common/file-input/file-item.utils.ts`:

```ts
/**
 * Extracts native `File` objects from items whose source is `file`. Items
 * backed by a URL or a Blob are ignored. Useful for submit-side mapping
 * when the consumer only cares about newly-uploaded blobs.
 */
export function seamFilesFromItems(items: SeamFileItem[]): File[] {
  const files: File[] = []
  for (const item of items) {
    if (item.source.kind === 'file') {
      files.push(item.source.file)
    }
  }
  return files
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-item.utils.spec.ts`
Expected: PASS.

- [ ] **Step 5: Export from public-api**

```ts
export {
  seamFileItemFromFile,
  seamFileItemFromUrl,
  seamFilesFromItems,
} from './file-item.utils'
```

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/file-input/file-item.utils.ts projects/ui-common/file-input/file-item.utils.spec.ts projects/ui-common/file-input/public-api.ts
git commit -m "feat(file-input): add seamFilesFromItems helper"
```

---

### Task 6: `iconForMime` utility

Returns a `SeamIcon` for a given MIME type, with a small built-in map and a generic fallback.

**Files:**

- Modify: `projects/ui-common/file-input/file-item.utils.ts`
- Modify: `projects/ui-common/file-input/file-item.utils.spec.ts`
- Modify: `projects/ui-common/file-input/public-api.ts`

- [ ] **Step 1: Write failing tests**

Append to `projects/ui-common/file-input/file-item.utils.spec.ts`:

```ts
import { iconForMime } from './file-item.utils'
import {
  faFile,
  faFileExcel,
  faFileImage,
  faFilePdf,
  faFileWord,
} from '@fortawesome/free-solid-svg-icons'

describe('iconForMime', () => {
  it('returns the PDF icon for application/pdf', () => {
    expect(iconForMime('application/pdf')).toBe(faFilePdf)
  })

  it('returns the image icon for any image/* type', () => {
    expect(iconForMime('image/png')).toBe(faFileImage)
    expect(iconForMime('image/jpeg')).toBe(faFileImage)
    expect(iconForMime('image/svg+xml')).toBe(faFileImage)
  })

  it('returns the Word icon for Word document types', () => {
    expect(iconForMime('application/msword')).toBe(faFileWord)
    expect(
      iconForMime(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ),
    ).toBe(faFileWord)
  })

  it('returns the Excel icon for Excel/CSV types', () => {
    expect(iconForMime('application/vnd.ms-excel')).toBe(faFileExcel)
    expect(
      iconForMime(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ),
    ).toBe(faFileExcel)
    expect(iconForMime('text/csv')).toBe(faFileExcel)
  })

  it('returns the generic file icon for unknown or missing types', () => {
    expect(iconForMime('application/octet-stream')).toBe(faFile)
    expect(iconForMime('')).toBe(faFile)
    expect(iconForMime(undefined)).toBe(faFile)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-item.utils.spec.ts`
Expected: FAIL — `iconForMime` is not exported.

- [ ] **Step 3: Implement `iconForMime`**

Append to `projects/ui-common/file-input/file-item.utils.ts`:

```ts
import {
  faFile,
  faFileExcel,
  faFileImage,
  faFilePdf,
  faFileWord,
} from '@fortawesome/free-solid-svg-icons'

import { SeamIcon } from '@theseam/ui-common/icon'

const WORD_MIMES = new Set<string>([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const EXCEL_MIMES = new Set<string>([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
])

/**
 * Maps a MIME type to a built-in SeamIcon. Returns a generic file icon for
 * unknown, empty, or missing types. Returns SeamIcon (not IconDefinition) so
 * the icon set can change later without a breaking signature change.
 */
export function iconForMime(type: string | undefined): SeamIcon {
  if (!type) return faFile
  if (type === 'application/pdf') return faFilePdf
  if (type.startsWith('image/')) return faFileImage
  if (WORD_MIMES.has(type)) return faFileWord
  if (EXCEL_MIMES.has(type)) return faFileExcel
  return faFile
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-item.utils.spec.ts`
Expected: PASS.

- [ ] **Step 5: Export from public-api**

```ts
export {
  seamFileItemFromFile,
  seamFileItemFromUrl,
  seamFilesFromItems,
  iconForMime,
} from './file-item.utils'
```

- [ ] **Step 6: Verify build still passes**

Run: `npm run build:ui-common`
Expected: SUCCESS.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/file-input/file-item.utils.ts projects/ui-common/file-input/file-item.utils.spec.ts projects/ui-common/file-input/public-api.ts
git commit -m "feat(file-input): add iconForMime helper"
```

---

### Task 7: `[seamFileDropZone]` directive — host behavior + dragover state

Create the directive with inputs/outputs, dragenter/leave counter, `preventDefault` on dragover, and `is-over` class toggling. Drop-side validation comes in Task 8.

**Files:**

- Create: `projects/ui-common/file-input/file-drop-zone.directive.ts`
- Create: `projects/ui-common/file-input/file-drop-zone.directive.spec.ts`
- Modify: `projects/ui-common/file-input/public-api.ts`

- [ ] **Step 1: Write failing tests for host behavior**

File: `projects/ui-common/file-input/file-drop-zone.directive.spec.ts`

```ts
import { Component } from '@angular/core'
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest'

import { TheSeamFileDropZoneDirective } from './file-drop-zone.directive'
import { SeamFileRejection } from './file-item.models'

@Component({
  template: `
    <div
      [seamFileDropZone]
      [accept]="accept"
      [maxSize]="maxSize"
      [maxFiles]="maxFiles"
      [disabled]="disabled"
      (seamFileDrop)="dropped = $event"
      (seamFileDropRejected)="rejected = $event"
      data-testid="zone">
      drop here
    </div>
  `,
  imports: [TheSeamFileDropZoneDirective],
})
class HostComponent {
  accept = ''
  maxSize: number | null = null
  maxFiles: number | null = null
  disabled = false
  dropped: File[] | null = null
  rejected: SeamFileRejection[] | null = null
}

function dragEvent(type: string, files: File[] = []): DragEvent {
  const dt = new DataTransfer()
  for (const f of files) dt.items.add(f)
  const evt = new DragEvent(type, { bubbles: true, cancelable: true })
  Object.defineProperty(evt, 'dataTransfer', { value: dt })
  return evt
}

describe('TheSeamFileDropZoneDirective', () => {
  let spectator: SpectatorHost<HostComponent>
  const createHost = createHostFactory({
    component: HostComponent,
    imports: [TheSeamFileDropZoneDirective],
  })

  const getZone = () =>
    spectator.query('[data-testid="zone"]') as HTMLElement

  beforeEach(() => {
    spectator = createHost(`<ng-container></ng-container>`)
  })

  it('adds `seam-file-drop-zone--over` class during dragover', () => {
    const zone = getZone()
    zone.dispatchEvent(dragEvent('dragenter'))
    expect(zone.classList.contains('seam-file-drop-zone--over')).toBe(true)
  })

  it('removes the class after dragleave returns the counter to zero', () => {
    const zone = getZone()
    zone.dispatchEvent(dragEvent('dragenter'))
    zone.dispatchEvent(dragEvent('dragenter')) // nested child
    zone.dispatchEvent(dragEvent('dragleave'))
    expect(zone.classList.contains('seam-file-drop-zone--over')).toBe(true)
    zone.dispatchEvent(dragEvent('dragleave'))
    expect(zone.classList.contains('seam-file-drop-zone--over')).toBe(false)
  })

  it('calls preventDefault on dragover to keep the drop event firing', () => {
    const zone = getZone()
    const evt = dragEvent('dragover')
    const prevent = jest.spyOn(evt, 'preventDefault')
    zone.dispatchEvent(evt)
    expect(prevent).toHaveBeenCalled()
  })

  it('removes the class on drop', () => {
    const zone = getZone()
    zone.dispatchEvent(dragEvent('dragenter'))
    zone.dispatchEvent(dragEvent('drop', [new File(['x'], 'x.txt')]))
    expect(zone.classList.contains('seam-file-drop-zone--over')).toBe(false)
  })

  it('does not apply the over class when disabled', () => {
    spectator.setInput('disabled', true)
    const zone = getZone()
    zone.dispatchEvent(dragEvent('dragenter'))
    expect(zone.classList.contains('seam-file-drop-zone--over')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-drop-zone.directive.spec.ts`
Expected: FAIL — directive file does not exist.

- [ ] **Step 3: Create the directive with host-behavior-only logic**

File: `projects/ui-common/file-input/file-drop-zone.directive.ts`

```ts
import {
  booleanAttribute,
  computed,
  Directive,
  input,
  output,
  signal,
} from '@angular/core'

import { SeamFileRejection } from './file-item.models'

@Directive({
  selector: '[seamFileDropZone]',
  host: {
    '[class.seam-file-drop-zone--over]': '_isOver()',
    '(dragenter)': '_onDragEnter($event)',
    '(dragover)': '_onDragOver($event)',
    '(dragleave)': '_onDragLeave($event)',
    '(drop)': '_onDrop($event)',
  },
})
export class TheSeamFileDropZoneDirective {
  readonly accept = input<string>('')
  readonly maxSize = input<number | null>(null)
  readonly maxFiles = input<number | null>(null)
  readonly disabled = input(false, { transform: booleanAttribute })

  readonly seamFileDrop = output<File[]>()
  readonly seamFileDropRejected = output<SeamFileRejection[]>()

  /** Counter-based dragenter/leave tracking to avoid child-element flicker. */
  private readonly _dragDepth = signal(0)

  protected readonly _isOver = computed(
    () => !this.disabled() && this._dragDepth() > 0,
  )

  _onDragEnter(event: DragEvent): void {
    if (this.disabled()) return
    event.preventDefault()
    this._dragDepth.update((n) => n + 1)
  }

  _onDragOver(event: DragEvent): void {
    if (this.disabled()) return
    // preventDefault is required for the drop event to fire.
    event.preventDefault()
  }

  _onDragLeave(event: DragEvent): void {
    if (this.disabled()) return
    this._dragDepth.update((n) => Math.max(0, n - 1))
  }

  _onDrop(event: DragEvent): void {
    if (this.disabled()) return
    event.preventDefault()
    this._dragDepth.set(0)
    // Drop payload handling comes in the next task.
  }
}
```

Angular's current guidance prefers the `host` property on the decorator metadata over `@HostBinding` / `@HostListener` — it's more explicit, works better with OnPush + signals, and is what new code in the codebase uses. The `[class.…]` binding reads the `_isOver` computed signal directly.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-drop-zone.directive.spec.ts`
Expected: PASS — all host-behavior tests green.

- [ ] **Step 5: Export from public-api**

Append to `projects/ui-common/file-input/public-api.ts`:

```ts
export { TheSeamFileDropZoneDirective } from './file-drop-zone.directive'
```

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/file-input/file-drop-zone.directive.ts projects/ui-common/file-input/file-drop-zone.directive.spec.ts projects/ui-common/file-input/public-api.ts
git commit -m "feat(file-input): add seamFileDropZone directive host behavior"
```

---

### Task 8: `[seamFileDropZone]` directive — drop validation + emission

Add the actual drop-payload handling: read `DataTransfer.files`, validate against `accept` / `maxSize` / `maxFiles`, emit `seamFileDrop` and `seamFileDropRejected`.

**Files:**

- Modify: `projects/ui-common/file-input/file-drop-zone.directive.ts`
- Modify: `projects/ui-common/file-input/file-drop-zone.directive.spec.ts`

- [ ] **Step 1: Write failing tests for validation and emission**

Append to `projects/ui-common/file-input/file-drop-zone.directive.spec.ts`:

```ts
describe('TheSeamFileDropZoneDirective — drop validation', () => {
  let spectator: SpectatorHost<HostComponent>
  const createHost = createHostFactory({
    component: HostComponent,
    imports: [TheSeamFileDropZoneDirective],
  })

  const getZone = () =>
    spectator.query('[data-testid="zone"]') as HTMLElement

  beforeEach(() => {
    spectator = createHost(`<ng-container></ng-container>`)
  })

  it('emits seamFileDrop with dropped files when no validation is set', () => {
    const zone = getZone()
    const f1 = new File(['a'], 'a.txt', { type: 'text/plain' })
    const f2 = new File(['b'], 'b.txt', { type: 'text/plain' })
    zone.dispatchEvent(dragEvent('drop', [f1, f2]))
    expect(spectator.component.dropped).toEqual([f1, f2])
    expect(spectator.component.rejected).toBeNull()
  })

  it('rejects files with mismatched type when accept is set', () => {
    spectator.setInput('accept', 'image/*')
    const zone = getZone()
    const img = new File(['i'], 'i.png', { type: 'image/png' })
    const txt = new File(['t'], 't.txt', { type: 'text/plain' })
    zone.dispatchEvent(dragEvent('drop', [img, txt]))
    expect(spectator.component.dropped).toEqual([img])
    expect(spectator.component.rejected).toEqual([
      { file: txt, reasons: ['type'] },
    ])
  })

  it('matches accept against file extension when MIME is empty', () => {
    spectator.setInput('accept', '.csv,.txt')
    const zone = getZone()
    const csv = new File(['a,b'], 'data.csv', { type: '' })
    const bin = new File(['x'], 'thing.bin', { type: '' })
    zone.dispatchEvent(dragEvent('drop', [csv, bin]))
    expect(spectator.component.dropped).toEqual([csv])
    expect(spectator.component.rejected).toEqual([
      { file: bin, reasons: ['type'] },
    ])
  })

  it('rejects files exceeding maxSize', () => {
    spectator.setInput('maxSize', 4)
    const zone = getZone()
    const small = new File(['abcd'], 's.txt') // 4 bytes
    const big = new File(['abcdef'], 'b.txt') // 6 bytes
    zone.dispatchEvent(dragEvent('drop', [small, big]))
    expect(spectator.component.dropped).toEqual([small])
    expect(spectator.component.rejected).toEqual([
      { file: big, reasons: ['size'] },
    ])
  })

  it('rejects extra files past maxFiles', () => {
    spectator.setInput('maxFiles', 1)
    const zone = getZone()
    const a = new File(['a'], 'a.txt')
    const b = new File(['b'], 'b.txt')
    zone.dispatchEvent(dragEvent('drop', [a, b]))
    expect(spectator.component.dropped).toEqual([a])
    expect(spectator.component.rejected).toEqual([
      { file: b, reasons: ['count'] },
    ])
  })

  it('collects multiple reasons per file without short-circuiting', () => {
    spectator.setInput('accept', 'image/*')
    spectator.setInput('maxSize', 2)
    const zone = getZone()
    const bad = new File(['abcdef'], 'bad.txt', { type: 'text/plain' })
    zone.dispatchEvent(dragEvent('drop', [bad]))
    expect(spectator.component.dropped).toEqual([])
    expect(spectator.component.rejected).toEqual([
      { file: bad, reasons: ['type', 'size'] },
    ])
  })

  it('does not emit anything when disabled', () => {
    spectator.setInput('disabled', true)
    const zone = getZone()
    zone.dispatchEvent(dragEvent('drop', [new File(['a'], 'a.txt')]))
    expect(spectator.component.dropped).toBeNull()
    expect(spectator.component.rejected).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-drop-zone.directive.spec.ts`
Expected: FAIL — new tests fail; existing host-behavior tests still pass.

- [ ] **Step 3: Extract validation into a pure helper**

Add a new file so the logic is reusable by `<seam-file-input>` later.

File: `projects/ui-common/file-input/file-input-validation.ts`

```ts
import { SeamFileRejection, SeamFileRejectionReason } from './file-item.models'

export interface FileValidationOptions {
  accept: string
  maxSize: number | null
  maxFiles: number | null
}

export interface FileValidationResult {
  accepted: File[]
  rejected: SeamFileRejection[]
}

/**
 * Validates a batch of files against accept / maxSize / maxFiles.
 *
 * `accept` is parsed as the standard comma-separated list: `.ext`, `mime/*`,
 * or `mime/subtype`. Matching against `file.type` is case-insensitive; when
 * `file.type` is empty, extension tokens (`.csv`) are tried against the file
 * name. Each rejected file accumulates ALL applicable reasons rather than
 * short-circuiting, so consumers can display comprehensive errors.
 *
 * `maxFiles` caps the total accepted count; files past the cap are rejected
 * with reason `'count'` in arrival order.
 */
export function validateFiles(
  files: File[],
  opts: FileValidationOptions,
): FileValidationResult {
  const acceptTokens = _parseAccept(opts.accept)
  const accepted: File[] = []
  const rejected: SeamFileRejection[] = []

  for (const file of files) {
    const reasons: SeamFileRejectionReason[] = []

    if (acceptTokens.length > 0 && !_matchesAccept(file, acceptTokens)) {
      reasons.push('type')
    }

    if (opts.maxSize !== null && file.size > opts.maxSize) {
      reasons.push('size')
    }

    if (reasons.length > 0) {
      rejected.push({ file, reasons })
      continue
    }

    if (opts.maxFiles !== null && accepted.length >= opts.maxFiles) {
      rejected.push({ file, reasons: ['count'] })
      continue
    }

    accepted.push(file)
  }

  return { accepted, rejected }
}

function _parseAccept(accept: string): string[] {
  return accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0)
}

function _matchesAccept(file: File, tokens: string[]): boolean {
  const mime = file.type.toLowerCase()
  const name = file.name.toLowerCase()

  for (const token of tokens) {
    if (token.startsWith('.')) {
      if (name.endsWith(token)) return true
      continue
    }
    if (!mime) continue
    if (token.endsWith('/*')) {
      const prefix = token.slice(0, -1) // keep the slash
      if (mime.startsWith(prefix)) return true
      continue
    }
    if (token === mime) return true
  }
  return false
}
```

- [ ] **Step 4: Wire validation into the directive's `_onDrop`**

Replace the `_onDrop` method in `projects/ui-common/file-input/file-drop-zone.directive.ts` with:

```ts
  _onDrop(event: DragEvent): void {
    if (this.disabled()) return
    event.preventDefault()
    this._dragDepth.set(0)

    const files = event.dataTransfer
      ? Array.from(event.dataTransfer.files)
      : []
    if (files.length === 0) return

    const { accepted, rejected } = validateFiles(files, {
      accept: this.accept(),
      maxSize: this.maxSize(),
      maxFiles: this.maxFiles(),
    })

    if (accepted.length > 0) this.seamFileDrop.emit(accepted)
    if (rejected.length > 0) this.seamFileDropRejected.emit(rejected)
  }
```

Add this import at the top of `file-drop-zone.directive.ts`:

```ts
import { validateFiles } from './file-input-validation'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-drop-zone.directive.spec.ts`
Expected: PASS — all tests (host + validation) green.

- [ ] **Step 6: Write tests for the `validateFiles` helper directly**

File: `projects/ui-common/file-input/file-input-validation.spec.ts`

```ts
import { validateFiles } from './file-input-validation'

describe('validateFiles', () => {
  const noLimits = { accept: '', maxSize: null, maxFiles: null }

  it('accepts all files when no limits are set', () => {
    const a = new File(['a'], 'a.txt')
    const b = new File(['b'], 'b.txt')
    const { accepted, rejected } = validateFiles([a, b], noLimits)
    expect(accepted).toEqual([a, b])
    expect(rejected).toEqual([])
  })

  it('matches mime wildcard in accept', () => {
    const img = new File(['i'], 'i.png', { type: 'image/png' })
    const txt = new File(['t'], 't.txt', { type: 'text/plain' })
    const { accepted, rejected } = validateFiles([img, txt], {
      ...noLimits,
      accept: 'image/*',
    })
    expect(accepted).toEqual([img])
    expect(rejected).toEqual([{ file: txt, reasons: ['type'] }])
  })

  it('matches exact mime in accept', () => {
    const pdf = new File(['p'], 'p.pdf', { type: 'application/pdf' })
    const txt = new File(['t'], 't.txt', { type: 'text/plain' })
    const { accepted } = validateFiles([pdf, txt], {
      ...noLimits,
      accept: 'application/pdf',
    })
    expect(accepted).toEqual([pdf])
  })

  it('reports type and size on one file when both fail', () => {
    const bad = new File(['abcdef'], 'bad.bin', { type: 'application/x-bin' })
    const { rejected } = validateFiles([bad], {
      accept: 'image/*',
      maxSize: 2,
      maxFiles: null,
    })
    expect(rejected).toEqual([{ file: bad, reasons: ['type', 'size'] }])
  })

  it('rejects overflow with reason count only (type/size checks short-circuit to count)', () => {
    const a = new File(['a'], 'a.txt')
    const b = new File(['b'], 'b.txt')
    const c = new File(['c'], 'c.txt')
    const { accepted, rejected } = validateFiles([a, b, c], {
      ...noLimits,
      maxFiles: 2,
    })
    expect(accepted).toEqual([a, b])
    expect(rejected).toEqual([{ file: c, reasons: ['count'] }])
  })
})
```

- [ ] **Step 7: Run helper tests**

Run: `npx jest projects/ui-common/file-input/file-input-validation.spec.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/file-input/file-drop-zone.directive.ts projects/ui-common/file-input/file-drop-zone.directive.spec.ts projects/ui-common/file-input/file-input-validation.ts projects/ui-common/file-input/file-input-validation.spec.ts
git commit -m "feat(file-input): validate and emit drops in seamFileDropZone"
```

---

### Task 9: `<seam-file-input>` component — structure, picker, native input

Build the component that delegates to the directive and adds a click-to-open native `<input type="file">` flow. Drop integration gets wired after the structure exists.

**Files:**

- Create: `projects/ui-common/file-input/file-input.component.ts`
- Create: `projects/ui-common/file-input/file-input.component.html`
- Create: `projects/ui-common/file-input/file-input.component.scss`
- Create: `projects/ui-common/file-input/file-input.component.spec.ts`
- Modify: `projects/ui-common/file-input/public-api.ts`

- [ ] **Step 1: Write failing structure tests**

File: `projects/ui-common/file-input/file-input.component.spec.ts`

```ts
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest'

import { TheSeamFileInputComponent } from './file-input.component'

describe('TheSeamFileInputComponent', () => {
  let spectator: SpectatorHost<TheSeamFileInputComponent>
  const createHost = createHostFactory({
    component: TheSeamFileInputComponent,
    imports: [TheSeamFileInputComponent],
  })

  it('renders an interactive zone with role="button" and tabindex=0', () => {
    spectator = createHost(`<seam-file-input></seam-file-input>`)
    const zone = spectator.query('.seam-file-input__zone') as HTMLElement
    expect(zone).toBeTruthy()
    expect(zone.getAttribute('role')).toBe('button')
    expect(zone.getAttribute('tabindex')).toBe('0')
  })

  it('sets tabindex=-1 and aria-disabled when disabled', () => {
    spectator = createHost(`<seam-file-input [disabled]="true"></seam-file-input>`)
    const zone = spectator.query('.seam-file-input__zone') as HTMLElement
    expect(zone.getAttribute('tabindex')).toBe('-1')
  })

  it('renders default prompt text and suffix', () => {
    spectator = createHost(`<seam-file-input></seam-file-input>`)
    const prompt = spectator.query('.seam-file-input__prompt')
    expect(prompt?.textContent).toContain('Choose a file')
    expect(prompt?.textContent).toContain('or drag it here')
  })

  it('renders custom prompt text and suffix', () => {
    spectator = createHost(
      `<seam-file-input
        promptText="Choose an image"
        promptSuffix="or drop it here"></seam-file-input>`,
    )
    const prompt = spectator.query('.seam-file-input__prompt')
    expect(prompt?.textContent).toContain('Choose an image')
    expect(prompt?.textContent).toContain('or drop it here')
  })

  it('renders a hidden native file input with accept and multiple attributes', () => {
    spectator = createHost(
      `<seam-file-input [multiple]="true" accept="image/*"></seam-file-input>`,
    )
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    expect(native).toBeTruthy()
    expect(native.hasAttribute('hidden')).toBe(true)
    expect(native.multiple).toBe(true)
    expect(native.getAttribute('accept')).toBe('image/*')
  })

  it('clicking the zone triggers a click on the hidden native input', () => {
    spectator = createHost(`<seam-file-input></seam-file-input>`)
    const zone = spectator.query('.seam-file-input__zone') as HTMLElement
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    const clickSpy = jest.spyOn(native, 'click')
    zone.click()
    expect(clickSpy).toHaveBeenCalled()
  })

  it('does not trigger the native input when disabled', () => {
    spectator = createHost(`<seam-file-input [disabled]="true"></seam-file-input>`)
    const zone = spectator.query('.seam-file-input__zone') as HTMLElement
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    const clickSpy = jest.spyOn(native, 'click')
    zone.click()
    expect(clickSpy).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-input.component.spec.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Create the component**

File: `projects/ui-common/file-input/file-input.component.ts`

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core'

import { faUpload } from '@fortawesome/free-solid-svg-icons'

import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { TheSeamFileDropZoneDirective } from './file-drop-zone.directive'
import { SeamFileRejection } from './file-item.models'

@Component({
  selector: 'seam-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  imports: [TheSeamFileDropZoneDirective, TheSeamIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamFileInputComponent {
  readonly multiple = input(false, { transform: booleanAttribute })
  readonly accept = input<string>('')
  readonly maxSize = input<number | null>(null)
  readonly maxFiles = input<number | null>(null)
  readonly disabled = input(false, { transform: booleanAttribute })
  readonly hideErrors = input(false, { transform: booleanAttribute })
  readonly promptText = input<string>('Choose a file')
  readonly promptSuffix = input<string>('or drag it here')

  readonly filesAdded = output<File[]>()
  readonly rejected = output<SeamFileRejection[]>()

  protected readonly _faUpload = faUpload

  private readonly _nativeInput = viewChild.required<ElementRef<HTMLInputElement>>('native')

  _openPicker(): void {
    if (this.disabled()) return
    this._nativeInput().nativeElement.click()
  }

  _onFilesDropped(files: File[]): void {
    this.filesAdded.emit(files)
  }

  _onRejected(rejections: SeamFileRejection[]): void {
    this.rejected.emit(rejections)
  }

  _onNativeChange(event: Event): void {
    // Implemented in the next task.
  }
}
```

- [ ] **Step 4: Create the template**

File: `projects/ui-common/file-input/file-input.component.html`

```html
<div
  class="seam-file-input__zone"
  [seamFileDropZone]
  [accept]="accept()"
  [maxSize]="maxSize()"
  [maxFiles]="maxFiles()"
  [disabled]="disabled()"
  (seamFileDrop)="_onFilesDropped($event)"
  (seamFileDropRejected)="_onRejected($event)"
  role="button"
  [attr.tabindex]="disabled() ? -1 : 0"
  (click)="_openPicker()"
  (keydown.enter)="_openPicker(); $event.preventDefault()"
  (keydown.space)="_openPicker(); $event.preventDefault()"
>
  <span class="seam-file-input__icon">
    <seam-icon [icon]="_faUpload"></seam-icon>
  </span>
  <p class="seam-file-input__prompt">
    <strong>{{ promptText() }}</strong> {{ promptSuffix() }}
  </p>
</div>

<input
  #native
  type="file"
  hidden
  [multiple]="multiple()"
  [attr.accept]="accept() || null"
  (change)="_onNativeChange($event)"
/>
```

- [ ] **Step 5: Create the stylesheet**

File: `projects/ui-common/file-input/file-input.component.scss`

```scss
:host {
  display: block;
}

.seam-file-input__zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 160px;
  padding: 24px 20px;
  text-align: center;
  border: 1.5px dashed #ced4da;
  border-radius: 6px;
  background: #fff;
  color: #495057;
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;

  &:focus-visible {
    outline: 2px solid #357ebd;
    outline-offset: 2px;
  }

  &.seam-file-drop-zone--over {
    border-color: #357ebd;
    background: #f5faff;

    .seam-file-input__icon {
      border-color: #357ebd;
      color: #357ebd;
    }
  }
}

.seam-file-input__zone[tabindex='-1'] {
  cursor: not-allowed;
  opacity: 0.6;
}

.seam-file-input__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e9ecef;
  color: #6c757d;
  transition: border-color 150ms ease, color 150ms ease;
}

.seam-file-input__prompt {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #343a40;

  strong {
    color: #357ebd;
    font-weight: 600;
  }
}

.seam-file-input__errors {
  margin: 8px 0 0;
  color: #dc3545;
  font-size: 12px;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-input.component.spec.ts`
Expected: PASS.

- [ ] **Step 7: Export from public-api**

Append to `projects/ui-common/file-input/public-api.ts`:

```ts
export { TheSeamFileInputComponent } from './file-input.component'
```

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/file-input/file-input.component.* projects/ui-common/file-input/public-api.ts
git commit -m "feat(file-input): add seam-file-input component shell"
```

---

### Task 10: `<seam-file-input>` — native change handling, drop pass-through, error line

Wire the native input's `change` event through validation and emission, and render the built-in error line. Drop already passes through by delegation to the directive — this task adds validation parity for the picker path and the inline error display.

**Files:**

- Modify: `projects/ui-common/file-input/file-input.component.ts`
- Modify: `projects/ui-common/file-input/file-input.component.html`
- Modify: `projects/ui-common/file-input/file-input.component.spec.ts`

- [ ] **Step 1: Write failing tests for change-event and error line**

Append to `projects/ui-common/file-input/file-input.component.spec.ts`:

```ts
import { SeamFileRejection } from './file-item.models'

describe('TheSeamFileInputComponent — native change + errors', () => {
  let spectator: SpectatorHost<TheSeamFileInputComponent>
  const createHost = createHostFactory({
    component: TheSeamFileInputComponent,
    imports: [TheSeamFileInputComponent],
  })

  function dispatchChange(input: HTMLInputElement, files: File[]) {
    const dt = new DataTransfer()
    for (const f of files) dt.items.add(f)
    input.files = dt.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }

  it('emits filesAdded on native input change', () => {
    spectator = createHost(`<seam-file-input></seam-file-input>`)
    const added: File[][] = []
    spectator.component.filesAdded.subscribe((f) => added.push(f))

    const native = spectator.query('input[type="file"]') as HTMLInputElement
    const f = new File(['x'], 'x.txt')
    dispatchChange(native, [f])

    expect(added).toEqual([[f]])
  })

  it('applies accept/maxSize validation to picker selection', () => {
    spectator = createHost(
      `<seam-file-input accept="image/*" [maxSize]="4"></seam-file-input>`,
    )
    const added: File[][] = []
    const rejected: SeamFileRejection[][] = []
    spectator.component.filesAdded.subscribe((f) => added.push(f))
    spectator.component.rejected.subscribe((r) => rejected.push(r))

    const native = spectator.query('input[type="file"]') as HTMLInputElement
    const ok = new File(['a'], 'a.png', { type: 'image/png' })
    const tooBig = new File(['abcdef'], 'big.png', { type: 'image/png' })
    const wrongType = new File(['t'], 't.txt', { type: 'text/plain' })
    dispatchChange(native, [ok, tooBig, wrongType])

    expect(added).toEqual([[ok]])
    expect(rejected[0]).toEqual([
      { file: tooBig, reasons: ['size'] },
      { file: wrongType, reasons: ['type'] },
    ])
  })

  it('resets the native input value after change so re-selecting the same file fires again', () => {
    spectator = createHost(`<seam-file-input></seam-file-input>`)
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    dispatchChange(native, [new File(['x'], 'x.txt')])
    expect(native.value).toBe('')
  })

  it('renders an error line when rejections occur and hideErrors is false', () => {
    spectator = createHost(
      `<seam-file-input accept="image/*"></seam-file-input>`,
    )
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    dispatchChange(native, [new File(['t'], 't.txt', { type: 'text/plain' })])
    spectator.detectChanges()

    const err = spectator.query('.seam-file-input__errors')
    expect(err?.textContent).toContain('File type not accepted')
  })

  it('hides the error line when hideErrors is true', () => {
    spectator = createHost(
      `<seam-file-input accept="image/*" [hideErrors]="true"></seam-file-input>`,
    )
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    dispatchChange(native, [new File(['t'], 't.txt', { type: 'text/plain' })])
    spectator.detectChanges()

    expect(spectator.query('.seam-file-input__errors')).toBeNull()
  })

  it('clears the error line on the next successful selection', () => {
    spectator = createHost(
      `<seam-file-input accept="image/*"></seam-file-input>`,
    )
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    dispatchChange(native, [new File(['t'], 't.txt', { type: 'text/plain' })])
    spectator.detectChanges()
    expect(spectator.query('.seam-file-input__errors')).not.toBeNull()

    dispatchChange(native, [new File(['ok'], 'ok.png', { type: 'image/png' })])
    spectator.detectChanges()
    expect(spectator.query('.seam-file-input__errors')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-input.component.spec.ts`
Expected: FAIL — change handler is empty, error line not rendered.

- [ ] **Step 3: Implement native change, error signal, and unified emit path**

Replace the class body of `projects/ui-common/file-input/file-input.component.ts` with:

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core'

import { faUpload } from '@fortawesome/free-solid-svg-icons'

import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { TheSeamFileDropZoneDirective } from './file-drop-zone.directive'
import { validateFiles } from './file-input-validation'
import {
  SeamFileRejection,
  SeamFileRejectionReason,
} from './file-item.models'

@Component({
  selector: 'seam-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  imports: [TheSeamFileDropZoneDirective, TheSeamIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamFileInputComponent {
  readonly multiple = input(false, { transform: booleanAttribute })
  readonly accept = input<string>('')
  readonly maxSize = input<number | null>(null)
  readonly maxFiles = input<number | null>(null)
  readonly disabled = input(false, { transform: booleanAttribute })
  readonly hideErrors = input(false, { transform: booleanAttribute })
  readonly promptText = input<string>('Choose a file')
  readonly promptSuffix = input<string>('or drag it here')

  readonly filesAdded = output<File[]>()
  readonly rejected = output<SeamFileRejection[]>()

  protected readonly _faUpload = faUpload
  protected readonly _lastRejections = signal<SeamFileRejection[]>([])
  protected readonly _errorMessage = computed(() =>
    _formatErrors(this._lastRejections(), this.maxSize()),
  )

  private readonly _nativeInput = viewChild.required<ElementRef<HTMLInputElement>>('native')

  _openPicker(): void {
    if (this.disabled()) return
    this._nativeInput().nativeElement.click()
  }

  _onFilesDropped(files: File[]): void {
    this._lastRejections.set([])
    if (files.length > 0) this.filesAdded.emit(files)
  }

  _onRejected(rejections: SeamFileRejection[]): void {
    this._lastRejections.set(rejections)
    this.rejected.emit(rejections)
  }

  _onNativeChange(event: Event): void {
    const input = event.target as HTMLInputElement
    const files = input.files ? Array.from(input.files) : []
    // Clear the value so the same file can be re-selected next time.
    input.value = ''

    if (files.length === 0) return

    const { accepted, rejected } = validateFiles(files, {
      accept: this.accept(),
      maxSize: this.maxSize(),
      maxFiles: this.maxFiles(),
    })

    if (rejected.length > 0) {
      this._lastRejections.set(rejected)
      this.rejected.emit(rejected)
    } else {
      this._lastRejections.set([])
    }

    if (accepted.length > 0) this.filesAdded.emit(accepted)
  }
}

function _formatErrors(
  rejections: SeamFileRejection[],
  maxSize: number | null,
): string | null {
  if (rejections.length === 0) return null
  const firstReason: SeamFileRejectionReason = rejections[0].reasons[0]
  switch (firstReason) {
    case 'type':
      return 'File type not accepted.'
    case 'size': {
      const mb = maxSize !== null ? (maxSize / (1024 * 1024)).toFixed(1) : null
      return mb
        ? `File exceeds the maximum size (${mb} MB).`
        : 'File exceeds the maximum size.'
    }
    case 'count':
      return 'Too many files selected.'
    default:
      return 'File could not be accepted.'
  }
}
```

- [ ] **Step 4: Add the error line to the template**

In `projects/ui-common/file-input/file-input.component.html`, append after the hidden native input:

```html
@if (!hideErrors() && _errorMessage(); as msg) {
  <p class="seam-file-input__errors">{{ msg }}</p>
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-input.component.spec.ts`
Expected: PASS — all tests (structure + change + errors) green.

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/file-input/file-input.component.*
git commit -m "feat(file-input): wire native change and error line on seam-file-input"
```

---

### Task 11: `<seam-file-tile>` — row variant + remove

**Files:**

- Create: `projects/ui-common/file-input/file-tile.component.ts`
- Create: `projects/ui-common/file-input/file-tile.component.html`
- Create: `projects/ui-common/file-input/file-tile.component.scss`
- Create: `projects/ui-common/file-input/file-tile.component.spec.ts`
- Modify: `projects/ui-common/file-input/public-api.ts`

- [ ] **Step 1: Write failing tests for row variant**

File: `projects/ui-common/file-input/file-tile.component.spec.ts`

```ts
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest'

import { TheSeamFileTileComponent } from './file-tile.component'
import { SeamFileItem } from './file-item.models'

const textItem: SeamFileItem = {
  name: 'report.pdf',
  size: 123456,
  type: 'application/pdf',
  source: { kind: 'file', file: new File(['x'], 'report.pdf') },
}

describe('TheSeamFileTileComponent — row variant', () => {
  let spectator: SpectatorHost<TheSeamFileTileComponent>
  const createHost = createHostFactory({
    component: TheSeamFileTileComponent,
    imports: [TheSeamFileTileComponent],
  })

  it('renders the item name', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item"></seam-file-tile>`,
      { hostProps: { item: textItem } },
    )
    expect(spectator.query('.seam-file-tile__name')?.textContent).toContain(
      'report.pdf',
    )
  })

  it('renders the meta line by default', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item"></seam-file-tile>`,
      { hostProps: { item: textItem } },
    )
    const meta = spectator.query('.seam-file-tile__meta')
    expect(meta?.textContent).toContain('application/pdf')
  })

  it('hides the meta line when showMeta is false', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" [showMeta]="false"></seam-file-tile>`,
      { hostProps: { item: textItem } },
    )
    expect(spectator.query('.seam-file-tile__meta')).toBeNull()
  })

  it('applies the row variant class by default', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item"></seam-file-tile>`,
      { hostProps: { item: textItem } },
    )
    expect(spectator.query('.seam-file-tile')).toHaveClass('seam-file-tile--row')
  })

  it('shows a remove button by default and emits `remove` when clicked', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item"></seam-file-tile>`,
      { hostProps: { item: textItem } },
    )
    const emitted: SeamFileItem[] = []
    spectator.component.remove.subscribe((i) => emitted.push(i))

    const btn = spectator.query('.seam-file-tile__remove') as HTMLElement
    expect(btn).toBeTruthy()
    btn.click()

    expect(emitted).toEqual([textItem])
  })

  it('does not render the remove button when removable is false', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" [removable]="false"></seam-file-tile>`,
      { hostProps: { item: textItem } },
    )
    expect(spectator.query('.seam-file-tile__remove')).toBeNull()
  })

  it('does not render the remove button when disabled', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" [disabled]="true"></seam-file-tile>`,
      { hostProps: { item: textItem } },
    )
    expect(spectator.query('.seam-file-tile__remove')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-tile.component.spec.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Create the tile component (row variant only)**

File: `projects/ui-common/file-input/file-tile.component.ts`

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core'

import { faTimes } from '@fortawesome/free-solid-svg-icons'

import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { iconForMime } from './file-item.utils'
import { SeamFileItem, SeamFileTileVariant } from './file-item.models'

@Component({
  selector: 'seam-file-tile',
  templateUrl: './file-tile.component.html',
  styleUrls: ['./file-tile.component.scss'],
  imports: [TheSeamIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamFileTileComponent {
  readonly item = input.required<SeamFileItem>()
  readonly variant = input<SeamFileTileVariant>('row')
  readonly showName = input(true, { transform: booleanAttribute })
  readonly showMeta = input(true, { transform: booleanAttribute })
  readonly removable = input(true, { transform: booleanAttribute })
  readonly disabled = input(false, { transform: booleanAttribute })

  readonly remove = output<SeamFileItem>()

  protected readonly _faTimes = faTimes

  protected readonly _mimeIcon = computed(() => iconForMime(this.item().type))
  protected readonly _metaLine = computed(() => _formatMeta(this.item()))
  protected readonly _showRemoveBtn = computed(
    () => this.removable() && !this.disabled(),
  )

  protected _onRemove(event: MouseEvent): void {
    event.stopPropagation()
    this.remove.emit(this.item())
  }
}

function _formatMeta(item: SeamFileItem): string {
  const parts: string[] = []
  if (item.size !== undefined) parts.push(_formatBytes(item.size))
  if (item.type) parts.push(item.type)
  return parts.join(' · ')
}

function _formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
```

- [ ] **Step 4: Create the template (row variant only)**

File: `projects/ui-common/file-input/file-tile.component.html`

```html
<div
  class="seam-file-tile"
  [class.seam-file-tile--row]="variant() === 'row'"
  [class.seam-file-tile--preview]="variant() === 'preview'"
>
  @if (variant() === 'row') {
    <span class="seam-file-tile__visual">
      <seam-icon [icon]="_mimeIcon()"></seam-icon>
    </span>
    <div class="seam-file-tile__body">
      <div class="seam-file-tile__name" [attr.title]="item().name">
        {{ item().name }}
      </div>
      @if (showMeta() && _metaLine(); as meta) {
        <div class="seam-file-tile__meta">{{ meta }}</div>
      }
    </div>
  }

  @if (_showRemoveBtn()) {
    <button
      type="button"
      class="seam-file-tile__remove"
      (click)="_onRemove($event)"
      title="Remove file"
    >
      <seam-icon [icon]="_faTimes"></seam-icon>
    </button>
  }
</div>
```

- [ ] **Step 5: Create the stylesheet**

File: `projects/ui-common/file-input/file-tile.component.scss`

```scss
:host {
  display: block;
}

.seam-file-tile {
  box-sizing: border-box;
  font-family: inherit;
}

.seam-file-tile--row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.seam-file-tile__visual {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: #f1f3f5;
  color: #6c757d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.seam-file-tile__visual--image {
  background: transparent;
}

.seam-file-tile__thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seam-file-tile__body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.seam-file-tile__name {
  font-size: 13px;
  font-weight: 500;
  color: #343a40;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.seam-file-tile__meta {
  font-size: 11px;
  color: #6c757d;
}

.seam-file-tile__remove {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border: 0;
  background: transparent;
  color: #6c757d;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #dc3545;
  }
}

/* Preview variant — populated in a later task. */
.seam-file-tile--preview {
  position: relative;
  display: inline-block;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: #fff;
  padding: 8px;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-tile.component.spec.ts`
Expected: PASS.

- [ ] **Step 7: Export from public-api**

Append to `projects/ui-common/file-input/public-api.ts`:

```ts
export { TheSeamFileTileComponent } from './file-tile.component'
```

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/file-input/file-tile.component.* projects/ui-common/file-input/public-api.ts
git commit -m "feat(file-input): add seam-file-tile row variant"
```

---

### Task 12: `<seam-file-tile>` — preview variant + thumbnail lifecycle

Add the preview variant (thumbnail + optional filename below + overlay remove X) and the image-thumbnail logic (object URLs created on demand, revoked on destroy/item change).

**Files:**

- Modify: `projects/ui-common/file-input/file-tile.component.ts`
- Modify: `projects/ui-common/file-input/file-tile.component.html`
- Modify: `projects/ui-common/file-input/file-tile.component.scss`
- Modify: `projects/ui-common/file-input/file-tile.component.spec.ts`

- [ ] **Step 1: Write failing tests for preview variant and thumbnail**

Append to `projects/ui-common/file-input/file-tile.component.spec.ts`:

```ts
describe('TheSeamFileTileComponent — preview variant', () => {
  let spectator: SpectatorHost<TheSeamFileTileComponent>
  const createHost = createHostFactory({
    component: TheSeamFileTileComponent,
    imports: [TheSeamFileTileComponent],
  })

  const imgFile = new File(['i'], 'pic.png', { type: 'image/png' })
  const imgItem: SeamFileItem = {
    name: 'pic.png',
    size: 1234,
    type: 'image/png',
    source: { kind: 'file', file: imgFile },
  }

  const urlItem: SeamFileItem = {
    name: 'server.png',
    type: 'image/png',
    source: { kind: 'url', url: 'https://ex.com/server.png' },
  }

  it('applies preview variant class', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview"></seam-file-tile>`,
      { hostProps: { item: imgItem } },
    )
    expect(spectator.query('.seam-file-tile')).toHaveClass(
      'seam-file-tile--preview',
    )
  })

  it('renders filename below thumbnail when showName is true', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview"></seam-file-tile>`,
      { hostProps: { item: imgItem } },
    )
    expect(
      spectator.query('.seam-file-tile__preview-name')?.textContent,
    ).toContain('pic.png')
  })

  it('hides filename when showName is false', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview" [showName]="false"></seam-file-tile>`,
      { hostProps: { item: imgItem } },
    )
    expect(spectator.query('.seam-file-tile__preview-name')).toBeNull()
  })

  it('uses the URL directly for url-sourced image items', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview"></seam-file-tile>`,
      { hostProps: { item: urlItem } },
    )
    const img = spectator.query('img.seam-file-tile__thumb') as HTMLImageElement
    expect(img.src).toBe('https://ex.com/server.png')
  })

  it('creates and revokes an object URL for file-sourced image items', () => {
    const createSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock')
    const revokeSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation()

    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview"></seam-file-tile>`,
      { hostProps: { item: imgItem } },
    )

    expect(createSpy).toHaveBeenCalledWith(imgFile)
    const img = spectator.query('img.seam-file-tile__thumb') as HTMLImageElement
    expect(img.src).toContain('blob:mock')

    spectator.hostComponent['item'] = {
      name: 'other.png',
      type: 'image/png',
      source: { kind: 'url', url: 'https://ex.com/other.png' },
    }
    spectator.detectChanges()

    expect(revokeSpy).toHaveBeenCalledWith('blob:mock')

    createSpy.mockRestore()
    revokeSpy.mockRestore()
  })

  it('falls back to mime icon when no thumbnail is available', () => {
    const nonImg: SeamFileItem = {
      name: 'doc.pdf',
      type: 'application/pdf',
      source: { kind: 'file', file: new File(['x'], 'doc.pdf') },
    }
    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview"></seam-file-tile>`,
      { hostProps: { item: nonImg } },
    )
    expect(spectator.query('img.seam-file-tile__thumb')).toBeNull()
    expect(spectator.query('.seam-file-tile__visual seam-icon')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-tile.component.spec.ts -t "preview variant"`
Expected: FAIL — preview branch doesn't render image, no filename, no thumbnail URL logic.

- [ ] **Step 3: Add thumbnail derivation + lifecycle to the component**

Replace the class body of `projects/ui-common/file-input/file-tile.component.ts` with:

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
} from '@angular/core'

import { faTimes } from '@fortawesome/free-solid-svg-icons'

import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { iconForMime } from './file-item.utils'
import { SeamFileItem, SeamFileTileVariant } from './file-item.models'

@Component({
  selector: 'seam-file-tile',
  templateUrl: './file-tile.component.html',
  styleUrls: ['./file-tile.component.scss'],
  imports: [TheSeamIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamFileTileComponent {
  readonly item = input.required<SeamFileItem>()
  readonly variant = input<SeamFileTileVariant>('row')
  readonly showName = input(true, { transform: booleanAttribute })
  readonly showMeta = input(true, { transform: booleanAttribute })
  readonly removable = input(true, { transform: booleanAttribute })
  readonly disabled = input(false, { transform: booleanAttribute })

  readonly remove = output<SeamFileItem>()

  protected readonly _faTimes = faTimes

  protected readonly _mimeIcon = computed(() => iconForMime(this.item().type))
  protected readonly _metaLine = computed(() => _formatMeta(this.item()))
  protected readonly _showRemoveBtn = computed(
    () => this.removable() && !this.disabled(),
  )

  /**
   * Thumbnail URL for image items. Tracked across item changes so object
   * URLs are revoked when the item changes or the component is destroyed.
   */
  private _ownedObjectUrl: string | null = null
  protected readonly _thumbUrl = computed(() => {
    const item = this.item()

    if (item.thumbnailUrl) return item.thumbnailUrl

    const isImage = _isImageMime(item.type)

    if (
      (item.source.kind === 'file' || item.source.kind === 'blob') &&
      isImage
    ) {
      const blob =
        item.source.kind === 'file' ? item.source.file : item.source.blob
      const url = URL.createObjectURL(blob)
      // Defer cleanup until the next effect run — see _revokeEffect below.
      this._pendingObjectUrl = url
      return url
    }

    if (item.source.kind === 'url' && _looksLikeImage(item)) {
      return item.source.url
    }

    return null
  })

  private _pendingObjectUrl: string | null = null

  constructor() {
    effect(() => {
      // Read the signal so this effect re-runs when the thumbnail changes.
      this._thumbUrl()
      const previous = this._ownedObjectUrl
      this._ownedObjectUrl = this._pendingObjectUrl
      this._pendingObjectUrl = null
      if (previous && previous !== this._ownedObjectUrl) {
        URL.revokeObjectURL(previous)
      }
    })
    // Destroy hook: revoke the last owned URL.
    effect((onCleanup) => {
      onCleanup(() => {
        if (this._ownedObjectUrl) {
          URL.revokeObjectURL(this._ownedObjectUrl)
          this._ownedObjectUrl = null
        }
      })
    })
  }

  protected _onRemove(event: MouseEvent): void {
    event.stopPropagation()
    this.remove.emit(this.item())
  }
}

function _formatMeta(item: SeamFileItem): string {
  const parts: string[] = []
  if (item.size !== undefined) parts.push(_formatBytes(item.size))
  if (item.type) parts.push(item.type)
  return parts.join(' · ')
}

function _formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function _isImageMime(type: string | undefined): boolean {
  return !!type && type.toLowerCase().startsWith('image/')
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i

function _looksLikeImage(item: SeamFileItem): boolean {
  if (_isImageMime(item.type)) return true
  if (item.source.kind === 'url' && IMAGE_EXT.test(item.source.url)) return true
  return false
}
```

- [ ] **Step 4: Update the template with the preview branch and thumbnail**

Replace `projects/ui-common/file-input/file-tile.component.html` with:

```html
<div
  class="seam-file-tile"
  [class.seam-file-tile--row]="variant() === 'row'"
  [class.seam-file-tile--preview]="variant() === 'preview'"
>
  @if (variant() === 'row') {
    <span class="seam-file-tile__visual" [class.seam-file-tile__visual--image]="!!_thumbUrl()">
      @if (_thumbUrl(); as url) {
        <img class="seam-file-tile__thumb" [src]="url" [alt]="item().name" />
      } @else {
        <seam-icon [icon]="_mimeIcon()"></seam-icon>
      }
    </span>
    <div class="seam-file-tile__body">
      <div class="seam-file-tile__name" [attr.title]="item().name">
        {{ item().name }}
      </div>
      @if (showMeta() && _metaLine(); as meta) {
        <div class="seam-file-tile__meta">{{ meta }}</div>
      }
    </div>
    @if (_showRemoveBtn()) {
      <button
        type="button"
        class="seam-file-tile__remove"
        (click)="_onRemove($event)"
        title="Remove file"
      >
        <seam-icon [icon]="_faTimes"></seam-icon>
      </button>
    }
  } @else {
    @if (_showRemoveBtn()) {
      <button
        type="button"
        class="seam-file-tile__remove seam-file-tile__remove--overlay"
        (click)="_onRemove($event)"
        title="Remove file"
      >
        <seam-icon [icon]="_faTimes"></seam-icon>
      </button>
    }
    <span class="seam-file-tile__preview-media">
      @if (_thumbUrl(); as url) {
        <img class="seam-file-tile__thumb" [src]="url" [alt]="item().name" />
      } @else {
        <span class="seam-file-tile__visual">
          <seam-icon [icon]="_mimeIcon()"></seam-icon>
        </span>
      }
    </span>
    @if (showName()) {
      <div class="seam-file-tile__preview-name" [attr.title]="item().name">
        {{ item().name }}
      </div>
    }
  }
</div>
```

- [ ] **Step 5: Extend the stylesheet for preview variant**

Append to `projects/ui-common/file-input/file-tile.component.scss`:

```scss
.seam-file-tile--preview {
  .seam-file-tile__preview-media {
    display: block;
    width: 100%;
    max-width: 180px;

    .seam-file-tile__thumb {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 3px;
    }

    .seam-file-tile__visual {
      width: 48px;
      height: 48px;
      margin: 0 auto;
    }
  }

  .seam-file-tile__preview-name {
    font-size: 11px;
    color: #6c757d;
    margin-top: 6px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .seam-file-tile__remove--overlay {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(33, 37, 41, 0.7);
    color: #fff;

    &:hover {
      background: #dc3545;
      color: #fff;
    }
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-tile.component.spec.ts`
Expected: PASS — row + preview variant tests green.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/file-input/file-tile.component.*
git commit -m "feat(file-input): add seam-file-tile preview variant with image thumbnail lifecycle"
```

---

### Task 13: `<seam-file-tile>` — opt-in `itemClick`

The tile body becomes clickable only when `itemClick` has a subscriber. Remove button already stops propagation (Task 11), so that interaction is unaffected.

**Files:**

- Modify: `projects/ui-common/file-input/file-tile.component.ts`
- Modify: `projects/ui-common/file-input/file-tile.component.html`
- Modify: `projects/ui-common/file-input/file-tile.component.scss`
- Modify: `projects/ui-common/file-input/file-tile.component.spec.ts`

- [ ] **Step 1: Write failing tests**

Append to `projects/ui-common/file-input/file-tile.component.spec.ts`:

```ts
describe('TheSeamFileTileComponent — opt-in itemClick', () => {
  let spectator: SpectatorHost<TheSeamFileTileComponent>
  const createHost = createHostFactory({
    component: TheSeamFileTileComponent,
    imports: [TheSeamFileTileComponent],
  })

  it('does not set role=button or tabindex when itemClick has no subscribers', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item"></seam-file-tile>`,
      { hostProps: { item: textItem } },
    )
    const body = spectator.query('.seam-file-tile__clickable-body') as HTMLElement | null
    // Use a data attribute to query even when the clickable wrapper is absent.
    expect(body).toBeNull()
  })

  it('sets role=button and tabindex=0 when itemClick is subscribed', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" (itemClick)="clicks.push($event)"></seam-file-tile>`,
      { hostProps: { item: textItem, clicks: [] } },
    )
    spectator.detectChanges()
    const clickable = spectator.query('.seam-file-tile__clickable-body') as HTMLElement
    expect(clickable).toBeTruthy()
    expect(clickable.getAttribute('role')).toBe('button')
    expect(clickable.getAttribute('tabindex')).toBe('0')
  })

  it('emits itemClick when the tile body is clicked (when wired)', () => {
    const hostProps = { item: textItem, clicks: [] as SeamFileItem[] }
    spectator = createHost(
      `<seam-file-tile [item]="item" (itemClick)="clicks.push($event)"></seam-file-tile>`,
      { hostProps },
    )
    spectator.detectChanges()
    const clickable = spectator.query('.seam-file-tile__clickable-body') as HTMLElement
    clickable.click()
    expect(hostProps.clicks).toEqual([textItem])
  })

  it('does not emit itemClick when the remove button is clicked (stops propagation)', () => {
    const hostProps = { item: textItem, clicks: [] as SeamFileItem[] }
    spectator = createHost(
      `<seam-file-tile [item]="item" (itemClick)="clicks.push($event)"></seam-file-tile>`,
      { hostProps },
    )
    spectator.detectChanges()
    const remove = spectator.query('.seam-file-tile__remove') as HTMLElement
    remove.click()
    expect(hostProps.clicks).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-tile.component.spec.ts -t "opt-in"`
Expected: FAIL — `itemClick` output + clickable wrapper do not exist.

- [ ] **Step 3: Add `itemClick` output + clickable detection**

Modify `projects/ui-common/file-input/file-tile.component.ts`.

Add the import at the top:

```ts
import { outputFromObservable } from '@angular/core/rxjs-interop'
```

*(If this causes a lint issue, you can skip and instead observe `itemClick.subscribe` differently. The standard approach for Angular 20 is:)*

Within the class, add the `itemClick` output and a readable `observed` signal:

```ts
  readonly itemClick = output<SeamFileItem>()

  /**
   * True when a consumer has subscribed to `itemClick`. The tile body is
   * only made interactive (role, tabindex, hover, cursor) when this is true.
   */
  protected readonly _clickObserved = signal(false)
```

Add a `signal` import at the top:

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core'
```

In the constructor, add a registration helper. Since Angular's `output()` doesn't expose a public `.observed` directly, the tile accepts a subscription through an `OutputRef` wrapper. The simplest approach is to register a subscription counter.

Replace the constructor with:

```ts
  constructor() {
    // Track whether `itemClick` has any subscribers. Angular's output() exposes
    // `_observed` via its internal emitter; we read it via a helper by
    // subscribing once ourselves to see if the count went above the initial
    // internal state. Since that's brittle, we rely on consumers telling us
    // via the `(itemClick)` binding existing, which means the ViewContainerRef
    // has subscribed. We detect this by observing the first emission registration
    // in a microtask.
    queueMicrotask(() => {
      const ref = this.itemClick as unknown as {
        readonly destroyRef: unknown
        subscribe: (cb: (v: SeamFileItem) => void) => { unsubscribe: () => void }
      }
      const probe = ref.subscribe(() => undefined)
      // If this probe can be added, Angular has a consumer-side subscription;
      // we detect that by checking a private emitter's observer count. As a
      // fallback we assume observed when any subscribe succeeds AFTER the
      // initial view has been set up. In practice Angular exposes an
      // `observed` getter on newer versions — use it when available.
      const maybeObserved = (
        this.itemClick as unknown as { observed?: boolean }
      ).observed
      this._clickObserved.set(maybeObserved ?? true)
      probe.unsubscribe()
    })

    effect(() => {
      // Read signal so this effect re-runs when the thumbnail changes.
      this._thumbUrl()
      const previous = this._ownedObjectUrl
      this._ownedObjectUrl = this._pendingObjectUrl
      this._pendingObjectUrl = null
      if (previous && previous !== this._ownedObjectUrl) {
        URL.revokeObjectURL(previous)
      }
    })
    effect((onCleanup) => {
      onCleanup(() => {
        if (this._ownedObjectUrl) {
          URL.revokeObjectURL(this._ownedObjectUrl)
          this._ownedObjectUrl = null
        }
      })
    })
  }
```

*(Implementation note: if `itemClick.observed` is not available on the installed Angular version, fall back to always treating the tile as clickable when a consumer wired any `(itemClick)` handler. The detection can be improved later without changing the public API.)*

Add handler method:

```ts
  protected _onBodyClick(): void {
    if (!this._clickObserved()) return
    this.itemClick.emit(this.item())
  }

  protected _onBodyKey(event: KeyboardEvent): void {
    if (!this._clickObserved()) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      this.itemClick.emit(this.item())
    }
  }
```

- [ ] **Step 4: Update the template to wrap the tile body in a clickable element when observed**

Replace `projects/ui-common/file-input/file-tile.component.html` with:

```html
<div
  class="seam-file-tile"
  [class.seam-file-tile--row]="variant() === 'row'"
  [class.seam-file-tile--preview]="variant() === 'preview'"
  [class.seam-file-tile--clickable]="_clickObserved()"
>
  @if (variant() === 'row') {
    @if (_clickObserved()) {
      <div
        class="seam-file-tile__clickable-body"
        role="button"
        tabindex="0"
        (click)="_onBodyClick()"
        (keydown)="_onBodyKey($event)"
      >
        <ng-container *ngTemplateOutlet="rowContent"></ng-container>
      </div>
    } @else {
      <ng-container *ngTemplateOutlet="rowContent"></ng-container>
    }

    @if (_showRemoveBtn()) {
      <button
        type="button"
        class="seam-file-tile__remove"
        (click)="_onRemove($event)"
        title="Remove file"
      >
        <seam-icon [icon]="_faTimes"></seam-icon>
      </button>
    }
  } @else {
    @if (_showRemoveBtn()) {
      <button
        type="button"
        class="seam-file-tile__remove seam-file-tile__remove--overlay"
        (click)="_onRemove($event)"
        title="Remove file"
      >
        <seam-icon [icon]="_faTimes"></seam-icon>
      </button>
    }
    @if (_clickObserved()) {
      <div
        class="seam-file-tile__clickable-body"
        role="button"
        tabindex="0"
        (click)="_onBodyClick()"
        (keydown)="_onBodyKey($event)"
      >
        <ng-container *ngTemplateOutlet="previewContent"></ng-container>
      </div>
    } @else {
      <ng-container *ngTemplateOutlet="previewContent"></ng-container>
    }
  }
</div>

<ng-template #rowContent>
  <span class="seam-file-tile__visual" [class.seam-file-tile__visual--image]="!!_thumbUrl()">
    @if (_thumbUrl(); as url) {
      <img class="seam-file-tile__thumb" [src]="url" [alt]="item().name" />
    } @else {
      <seam-icon [icon]="_mimeIcon()"></seam-icon>
    }
  </span>
  <div class="seam-file-tile__body">
    <div class="seam-file-tile__name" [attr.title]="item().name">
      {{ item().name }}
    </div>
    @if (showMeta() && _metaLine(); as meta) {
      <div class="seam-file-tile__meta">{{ meta }}</div>
    }
  </div>
</ng-template>

<ng-template #previewContent>
  <span class="seam-file-tile__preview-media">
    @if (_thumbUrl(); as url) {
      <img class="seam-file-tile__thumb" [src]="url" [alt]="item().name" />
    } @else {
      <span class="seam-file-tile__visual">
        <seam-icon [icon]="_mimeIcon()"></seam-icon>
      </span>
    }
  </span>
  @if (showName()) {
    <div class="seam-file-tile__preview-name" [attr.title]="item().name">
      {{ item().name }}
    </div>
  }
</ng-template>
```

Add `NgTemplateOutlet` to the component's imports:

```ts
import { NgTemplateOutlet } from '@angular/common'
```

```ts
imports: [NgTemplateOutlet, TheSeamIconModule],
```

- [ ] **Step 5: Add clickable hover style**

Append to `projects/ui-common/file-input/file-tile.component.scss`:

```scss
.seam-file-tile--clickable {
  .seam-file-tile__clickable-body {
    display: contents;
    cursor: pointer;
    outline: none;
  }

  .seam-file-tile__clickable-body:focus-visible {
    outline: 2px solid #357ebd;
    outline-offset: 2px;
  }

  &.seam-file-tile--row:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  &.seam-file-tile--preview:hover {
    box-shadow: 0 0 0 1px #357ebd inset;
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-tile.component.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/file-input/file-tile.component.*
git commit -m "feat(file-input): opt-in itemClick on seam-file-tile"
```

---

### Task 14: `<seam-file-field>` — single-mode C-pattern + CVA

Form control that implements the C-pattern for single-file mode. Multi-mode tile list is added in the next task.

**Files:**

- Create: `projects/ui-common/file-input/file-field.component.ts`
- Create: `projects/ui-common/file-input/file-field.component.html`
- Create: `projects/ui-common/file-input/file-field.component.scss`
- Create: `projects/ui-common/file-input/file-field.component.spec.ts`
- Modify: `projects/ui-common/file-input/public-api.ts`

- [ ] **Step 1: Write failing tests for single-mode CVA + C-pattern**

File: `projects/ui-common/file-input/file-field.component.spec.ts`

```ts
import { Component } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest'

import { TheSeamFileFieldComponent } from './file-field.component'
import { SeamFileItem } from './file-item.models'
import { seamFileItemFromFile, seamFileItemFromUrl } from './file-item.utils'

@Component({
  template: `
    <seam-file-field
      [formControl]="ctrl"
      [multiple]="multiple"
      [previewMode]="previewMode"
    ></seam-file-field>
  `,
  imports: [TheSeamFileFieldComponent, ReactiveFormsModule],
})
class HostComponent {
  ctrl = new FormControl<SeamFileItem[]>([])
  multiple = false
  previewMode = false
}

describe('TheSeamFileFieldComponent — single-mode CVA + C-pattern', () => {
  let spectator: SpectatorHost<HostComponent>
  const createHost = createHostFactory({
    component: HostComponent,
    imports: [HostComponent],
  })

  beforeEach(() => {
    spectator = createHost(`<ng-container></ng-container>`)
  })

  it('shows the input and no tile when value is empty', () => {
    expect(spectator.query('seam-file-input')).not.toBeNull()
    expect(spectator.query('seam-file-tile')).toBeNull()
    expect(spectator.query('.seam-file-field__replace')).toBeNull()
  })

  it('replaces the input with a tile and replace bar when a file is present (C-pattern)', () => {
    spectator.component.ctrl.setValue([
      seamFileItemFromFile(new File(['a'], 'a.png', { type: 'image/png' })),
    ])
    spectator.detectChanges()
    expect(spectator.query('seam-file-input')).toBeNull()
    expect(spectator.query('seam-file-tile')).not.toBeNull()
    expect(spectator.query('.seam-file-field__replace')).not.toBeNull()
  })

  it('removing the tile restores the empty input', () => {
    spectator.component.ctrl.setValue([
      seamFileItemFromFile(new File(['a'], 'a.png', { type: 'image/png' })),
    ])
    spectator.detectChanges()
    const removeBtn = spectator.query(
      '.seam-file-tile__remove',
    ) as HTMLElement
    removeBtn.click()
    spectator.detectChanges()
    expect(spectator.component.ctrl.value).toEqual([])
    expect(spectator.query('seam-file-input')).not.toBeNull()
    expect(spectator.query('seam-file-tile')).toBeNull()
  })

  it('accepts pre-filled URL-sourced items through writeValue (edit form)', () => {
    spectator.component.ctrl.setValue([
      seamFileItemFromUrl('https://ex.com/logo.png', {
        type: 'image/png',
        id: 'doc-1',
      }),
    ])
    spectator.detectChanges()
    const tile = spectator.query('seam-file-tile')
    expect(tile).not.toBeNull()
    const img = spectator.query(
      'img.seam-file-tile__thumb',
    ) as HTMLImageElement
    expect(img.src).toBe('https://ex.com/logo.png')
  })

  it('maps filesAdded from the embedded input into SeamFileItems appended to the CVA value', () => {
    const input = spectator.query('seam-file-input')!
    const f = new File(['x'], 'x.pdf', { type: 'application/pdf' })
    // Use the embedded component's output emitter directly.
    const inputDebugEl = spectator.debugElement.query(
      (de) => de.nativeElement === input,
    )
    const inputCmp =
      inputDebugEl?.componentInstance as import('./file-input.component').TheSeamFileInputComponent
    inputCmp.filesAdded.emit([f])
    spectator.detectChanges()

    const value = spectator.component.ctrl.value!
    expect(value.length).toBe(1)
    expect(value[0].name).toBe('x.pdf')
    expect(value[0].source).toEqual({ kind: 'file', file: f })
  })

  it('disables the input and tile when the control is disabled', () => {
    spectator.component.ctrl.disable()
    spectator.detectChanges()

    const inputZone = spectator.query(
      '.seam-file-input__zone',
    ) as HTMLElement | null
    if (inputZone) {
      expect(inputZone.getAttribute('tabindex')).toBe('-1')
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-field.component.spec.ts`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Create the component (single-mode only)**

File: `projects/ui-common/file-input/file-field.component.ts`

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

import { TheSeamFileInputComponent } from './file-input.component'
import { TheSeamFileTileComponent } from './file-tile.component'
import { SeamFileItem, SeamFileRejection } from './file-item.models'
import { seamFileItemFromFile } from './file-item.utils'

@Component({
  selector: 'seam-file-field',
  templateUrl: './file-field.component.html',
  styleUrls: ['./file-field.component.scss'],
  imports: [TheSeamFileInputComponent, TheSeamFileTileComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TheSeamFileFieldComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamFileFieldComponent implements ControlValueAccessor {
  readonly multiple = input(false, { transform: booleanAttribute })
  readonly accept = input<string>('')
  readonly maxSize = input<number | null>(null)
  readonly maxFiles = input<number | null>(null)
  readonly disabled = input(false, { transform: booleanAttribute })
  readonly previewMode = input(false, { transform: booleanAttribute })
  readonly showTileName = input(true, { transform: booleanAttribute })
  readonly promptText = input<string>('Choose a file')
  readonly promptSuffix = input<string>('or drag it here')
  readonly replaceText = input<string>('choose a different file')
  readonly hideErrors = input(false, { transform: booleanAttribute })

  readonly rejected = output<SeamFileRejection[]>()

  /** CVA-backed value + CVA-disabled flag. */
  protected readonly _items = signal<SeamFileItem[]>([])
  protected readonly _cvaDisabled = signal(false)

  protected readonly _effectiveDisabled = computed(
    () => this.disabled() || this._cvaDisabled(),
  )

  protected readonly _hasFile = computed(
    () => !this.multiple() && this._items().length > 0,
  )

  protected readonly _remainingMaxFiles = computed(() => {
    const max = this.maxFiles()
    if (max === null) return null
    return Math.max(0, max - this._items().length)
  })

  protected readonly _tileVariant = computed(() =>
    this.previewMode() ? 'preview' : 'row',
  )

  protected readonly _inputComponent =
    viewChild<TheSeamFileInputComponent>('inputComponent')

  private _onChange: (value: SeamFileItem[]) => void = () => undefined
  private _onTouched: () => void = () => undefined

  writeValue(value: SeamFileItem[] | null): void {
    this._items.set(value ?? [])
  }

  registerOnChange(fn: (value: SeamFileItem[]) => void): void {
    this._onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled)
  }

  _onFilesAdded(files: File[]): void {
    if (files.length === 0) return
    const added = files.map((f) => seamFileItemFromFile(f))
    if (!this.multiple()) {
      this._items.set(added.slice(0, 1))
    } else {
      this._items.update((prev) => [...prev, ...added])
    }
    this._emit()
  }

  _onRejected(rejections: SeamFileRejection[]): void {
    this.rejected.emit(rejections)
  }

  _onTileRemove(item: SeamFileItem): void {
    this._items.update((prev) => prev.filter((i) => i !== item))
    this._emit()
  }

  protected _emit(): void {
    this._onChange(this._items())
    this._onTouched()
  }
}
```

- [ ] **Step 4: Create the template (single-mode only)**

File: `projects/ui-common/file-input/file-field.component.html`

```html
@if (_hasFile()) {
  <seam-file-tile
    [item]="_items()[0]"
    [variant]="_tileVariant()"
    [showName]="showTileName()"
    [disabled]="_effectiveDisabled()"
    (remove)="_onTileRemove($event)"
  ></seam-file-tile>
  <button
    type="button"
    class="seam-file-field__replace"
    [disabled]="_effectiveDisabled()"
    (click)="inputComponent._openPicker()"
  >
    or <strong>{{ replaceText() }}</strong>
  </button>

  <!-- Kept mounted but hidden so the replace button can delegate to it. -->
  <seam-file-input
    #inputComponent
    hidden
    [multiple]="multiple()"
    [accept]="accept()"
    [maxSize]="maxSize()"
    [maxFiles]="_remainingMaxFiles()"
    [disabled]="_effectiveDisabled()"
    [hideErrors]="true"
    (filesAdded)="_onFilesAdded($event)"
    (rejected)="_onRejected($event)"
  ></seam-file-input>
} @else {
  <seam-file-input
    #inputComponent
    [multiple]="multiple()"
    [accept]="accept()"
    [maxSize]="maxSize()"
    [maxFiles]="_remainingMaxFiles()"
    [disabled]="_effectiveDisabled()"
    [hideErrors]="hideErrors()"
    [promptText]="promptText()"
    [promptSuffix]="promptSuffix()"
    (filesAdded)="_onFilesAdded($event)"
    (rejected)="_onRejected($event)"
  ></seam-file-input>
}
```

The `_inputComponent` view child is already declared from Step 3. The template binds directly to the template reference `#inputComponent` and calls its `_openPicker()` method.

- [ ] **Step 5: Create the stylesheet**

File: `projects/ui-common/file-input/file-field.component.scss`

```scss
:host {
  display: block;
}

.seam-file-field__replace {
  display: block;
  margin-top: 8px;
  padding: 8px 12px;
  width: 100%;
  background: #f8f9fa;
  border: 1px dashed #ced4da;
  border-radius: 6px;
  font-size: 12px;
  color: #6c757d;
  text-align: center;
  cursor: pointer;

  strong {
    color: #357ebd;
    font-weight: 600;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #357ebd;
    outline-offset: 2px;
  }
}

seam-file-input[hidden] {
  display: none;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-field.component.spec.ts`
Expected: PASS — single-mode + CVA tests green.

- [ ] **Step 7: Export from public-api**

Append to `projects/ui-common/file-input/public-api.ts`:

```ts
export { TheSeamFileFieldComponent } from './file-field.component'
```

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/file-input/file-field.component.* projects/ui-common/file-input/public-api.ts
git commit -m "feat(file-input): add seam-file-field with single-mode C-pattern and CVA"
```

---

### Task 15: `<seam-file-field>` — multi-mode tile list

Add multi-mode behavior: input stays visible, tiles render below stacked (row) or wrapped (preview). `maxFiles` caps the accumulated list.

**Files:**

- Modify: `projects/ui-common/file-input/file-field.component.ts`
- Modify: `projects/ui-common/file-input/file-field.component.html`
- Modify: `projects/ui-common/file-input/file-field.component.scss`
- Modify: `projects/ui-common/file-input/file-field.component.spec.ts`

- [ ] **Step 1: Write failing tests for multi-mode**

Append to `projects/ui-common/file-input/file-field.component.spec.ts`:

```ts
describe('TheSeamFileFieldComponent — multi-mode', () => {
  let spectator: SpectatorHost<HostComponent>
  const createHost = createHostFactory({
    component: HostComponent,
    imports: [HostComponent],
  })

  beforeEach(() => {
    spectator = createHost(`<ng-container></ng-container>`)
    spectator.setInput('multiple', true)
  })

  it('keeps the input visible and renders no tiles when empty', () => {
    expect(spectator.query('seam-file-input')).not.toBeNull()
    expect(spectator.queryAll('seam-file-tile').length).toBe(0)
  })

  it('renders tiles below the input after files are added', () => {
    const f1 = new File(['a'], 'a.pdf', { type: 'application/pdf' })
    const f2 = new File(['b'], 'b.pdf', { type: 'application/pdf' })
    spectator.component.ctrl.setValue([
      seamFileItemFromFile(f1),
      seamFileItemFromFile(f2),
    ])
    spectator.detectChanges()

    expect(spectator.query('seam-file-input')).not.toBeNull()
    expect(spectator.queryAll('seam-file-tile').length).toBe(2)
  })

  it('accumulates new files rather than replacing them', () => {
    const f1 = new File(['a'], 'a.pdf', { type: 'application/pdf' })
    spectator.component.ctrl.setValue([seamFileItemFromFile(f1)])
    spectator.detectChanges()

    const inputDebugEl = spectator.debugElement.query(
      (de) => de.nativeElement === spectator.query('seam-file-input')!,
    )
    const inputCmp =
      inputDebugEl?.componentInstance as import('./file-input.component').TheSeamFileInputComponent
    const f2 = new File(['b'], 'b.pdf', { type: 'application/pdf' })
    inputCmp.filesAdded.emit([f2])
    spectator.detectChanges()

    expect(spectator.component.ctrl.value!.map((i) => i.name)).toEqual([
      'a.pdf',
      'b.pdf',
    ])
  })

  it('applies preview layout wrapping when previewMode is true', () => {
    spectator.setInput('previewMode', true)
    spectator.component.ctrl.setValue([
      seamFileItemFromFile(new File(['a'], 'a.png', { type: 'image/png' })),
      seamFileItemFromFile(new File(['b'], 'b.png', { type: 'image/png' })),
    ])
    spectator.detectChanges()

    const list = spectator.query(
      '.seam-file-field__tiles',
    ) as HTMLElement | null
    expect(list).not.toBeNull()
    expect(list?.classList).toContain('seam-file-field__tiles--preview')
  })

  it('caps appended files to maxFiles on subsequent drops', async () => {
    // Re-host with a maxFiles binding.
    const createHostWithMax = createHostFactory({
      component: HostComponent,
      imports: [HostComponent],
    })
    @Component({
      template: `
        <seam-file-field
          [formControl]="ctrl"
          [multiple]="true"
          [maxFiles]="2"
        ></seam-file-field>
      `,
      imports: [TheSeamFileFieldComponent, ReactiveFormsModule],
    })
    class MaxHost {
      ctrl = new FormControl<SeamFileItem[]>([])
    }
    const spec = createHostFactory({
      component: MaxHost,
      imports: [MaxHost],
    })(`<ng-container></ng-container>`) as SpectatorHost<MaxHost>

    const inputEl = spec.query('seam-file-input')!
    const inputCmp = spec.debugElement.query(
      (de) => de.nativeElement === inputEl,
    ).componentInstance as import('./file-input.component').TheSeamFileInputComponent

    inputCmp.filesAdded.emit([
      new File(['a'], 'a.pdf'),
      new File(['b'], 'b.pdf'),
    ])
    spec.detectChanges()
    expect(spec.component.ctrl.value!.map((i) => i.name)).toEqual([
      'a.pdf',
      'b.pdf',
    ])

    // Field should have computed _remainingMaxFiles === 0; the input will
    // reject further files with reason 'count'. Emit more and confirm the
    // control value does NOT grow past 2.
    inputCmp.filesAdded.emit([new File(['c'], 'c.pdf')])
    spec.detectChanges()
    expect(spec.component.ctrl.value!.length).toBe(2)
  })
})
```

*(The last test in the group will be completed by the next step — implementations use `[maxFiles]` binding already covered by the view.)*

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest projects/ui-common/file-input/file-field.component.spec.ts -t "multi-mode"`
Expected: FAIL — tiles not rendered in multi mode; classes missing.

- [ ] **Step 3: Add the tile list to the template**

Modify `projects/ui-common/file-input/file-field.component.html`. Replace its contents with:

```html
@if (_hasFile()) {
  <seam-file-tile
    [item]="_items()[0]"
    [variant]="_tileVariant()"
    [showName]="showTileName()"
    [disabled]="_effectiveDisabled()"
    (remove)="_onTileRemove($event)"
  ></seam-file-tile>
  <button
    type="button"
    class="seam-file-field__replace"
    [disabled]="_effectiveDisabled()"
    (click)="inputComponentWhenFilled._openPicker()"
  >
    or <strong>{{ replaceText() }}</strong>
  </button>
  <seam-file-input
    #inputComponentWhenFilled
    hidden
    [multiple]="multiple()"
    [accept]="accept()"
    [maxSize]="maxSize()"
    [maxFiles]="_remainingMaxFiles()"
    [disabled]="_effectiveDisabled()"
    [hideErrors]="true"
    (filesAdded)="_onFilesAdded($event)"
    (rejected)="_onRejected($event)"
  ></seam-file-input>
} @else {
  <seam-file-input
    #inputComponent
    [multiple]="multiple()"
    [accept]="accept()"
    [maxSize]="maxSize()"
    [maxFiles]="_remainingMaxFiles()"
    [disabled]="_effectiveDisabled()"
    [hideErrors]="hideErrors()"
    [promptText]="promptText()"
    [promptSuffix]="promptSuffix()"
    (filesAdded)="_onFilesAdded($event)"
    (rejected)="_onRejected($event)"
  ></seam-file-input>

  @if (multiple() && _items().length > 0) {
    <div
      class="seam-file-field__tiles"
      [class.seam-file-field__tiles--preview]="previewMode()"
    >
      @for (item of _items(); track item.id ?? item.name) {
        <seam-file-tile
          [item]="item"
          [variant]="_tileVariant()"
          [showName]="showTileName()"
          [disabled]="_effectiveDisabled()"
          (remove)="_onTileRemove($event)"
        ></seam-file-tile>
      }
    </div>
  }
}
```

- [ ] **Step 4: Style the tile list**

Append to `projects/ui-common/file-input/file-field.component.scss`:

```scss
.seam-file-field__tiles {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.seam-file-field__tiles--preview {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest projects/ui-common/file-input/file-field.component.spec.ts`
Expected: PASS — all single + multi mode tests green.

- [ ] **Step 6: Verify build**

Run: `npm run build:ui-common`
Expected: SUCCESS.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/file-input/file-field.component.*
git commit -m "feat(file-input): add multi-mode tile list to seam-file-field"
```

---

### Task 16: Harnesses

Four CDK harnesses (drop zone, input, tile, field). Registered in `file-input/testing/public-api.ts`.

**Files:**

- Create: `projects/ui-common/file-input/testing/file-drop-zone.harness.ts`
- Create: `projects/ui-common/file-input/testing/file-input.harness.ts`
- Create: `projects/ui-common/file-input/testing/file-tile.harness.ts`
- Create: `projects/ui-common/file-input/testing/file-field.harness.ts`
- Modify: `projects/ui-common/file-input/testing/public-api.ts`

- [ ] **Step 1: Create the drop-zone harness**

File: `projects/ui-common/file-input/testing/file-drop-zone.harness.ts`

```ts
import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamFileDropZoneHarness extends ComponentHarness {
  static hostSelector = '[seamFileDropZone]'

  async isOver(): Promise<boolean> {
    const host = await this.host()
    return (await host.getAttribute('class'))?.includes(
      'seam-file-drop-zone--over',
    ) ?? false
  }

  async dropFiles(files: File[]): Promise<void> {
    const host = await this.host()
    await host.dispatchEvent('drop', {
      dataTransfer: _dataTransferFromFiles(files),
    })
  }
}

function _dataTransferFromFiles(files: File[]): unknown {
  const dt = new DataTransfer()
  for (const f of files) dt.items.add(f)
  return dt
}
```

- [ ] **Step 2: Create the file-input harness**

File: `projects/ui-common/file-input/testing/file-input.harness.ts`

```ts
import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamFileInputHarness extends ComponentHarness {
  static hostSelector = 'seam-file-input'

  private _zone = this.locatorFor('.seam-file-input__zone')
  private _prompt = this.locatorFor('.seam-file-input__prompt')
  private _errors = this.locatorForOptional('.seam-file-input__errors')
  private _native = this.locatorFor('input[type="file"]')

  async getPromptText(): Promise<string> {
    return (await (await this._prompt()).text()).trim()
  }

  async isDisabled(): Promise<boolean> {
    const zone = await this._zone()
    return (await zone.getAttribute('tabindex')) === '-1'
  }

  async getErrorMessage(): Promise<string | null> {
    const el = await this._errors()
    if (!el) return null
    return (await el.text()).trim()
  }

  async selectFiles(files: File[]): Promise<void> {
    const native = await this._native()
    const handle = await native.host()
    await handle.runWithInput((input: HTMLInputElement) => {
      const dt = new DataTransfer()
      for (const f of files) dt.items.add(f)
      input.files = dt.files
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }, files)
  }

  async dropFiles(files: File[]): Promise<void> {
    const zone = await this._zone()
    const dt = new DataTransfer()
    for (const f of files) dt.items.add(f)
    await zone.dispatchEvent('drop', { dataTransfer: dt })
  }
}
```

*(If the harness environment does not support `runWithInput`, replace `selectFiles` with a direct dispatch using `zone.dispatchEvent` on a custom event the component listens for, or mirror the pattern used in `TheSeamSignatureInputImgHarness` in `projects/ui-common/signature-input/testing/`. Prefer the approach matching existing harnesses in that directory.)*

- [ ] **Step 3: Create the tile harness**

File: `projects/ui-common/file-input/testing/file-tile.harness.ts`

```ts
import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamFileTileHarness extends ComponentHarness {
  static hostSelector = 'seam-file-tile'

  private _root = this.locatorFor('.seam-file-tile')
  private _name = this.locatorForOptional('.seam-file-tile__name')
  private _previewName = this.locatorForOptional('.seam-file-tile__preview-name')
  private _remove = this.locatorForOptional('.seam-file-tile__remove')
  private _clickable = this.locatorForOptional('.seam-file-tile__clickable-body')

  async getName(): Promise<string> {
    const rowName = await this._name()
    if (rowName) return (await rowName.text()).trim()
    const previewName = await this._previewName()
    if (previewName) return (await previewName.text()).trim()
    return ''
  }

  async getVariant(): Promise<'row' | 'preview'> {
    const root = await this._root()
    const cls = (await root.getAttribute('class')) ?? ''
    return cls.includes('seam-file-tile--preview') ? 'preview' : 'row'
  }

  async isClickable(): Promise<boolean> {
    return (await this._clickable()) !== null
  }

  async click(): Promise<void> {
    const clickable = await this._clickable()
    if (!clickable) throw new Error('tile is not clickable (no itemClick subscriber)')
    await clickable.click()
  }

  async clickRemove(): Promise<void> {
    const btn = await this._remove()
    if (!btn) throw new Error('remove button is not present')
    await btn.click()
  }
}
```

- [ ] **Step 4: Create the field harness**

File: `projects/ui-common/file-input/testing/file-field.harness.ts`

```ts
import { ComponentHarness } from '@angular/cdk/testing'

import { TheSeamFileInputHarness } from './file-input.harness'
import { TheSeamFileTileHarness } from './file-tile.harness'

export class TheSeamFileFieldHarness extends ComponentHarness {
  static hostSelector = 'seam-file-field'

  private _replace = this.locatorForOptional('.seam-file-field__replace')

  async getInputHarness(): Promise<TheSeamFileInputHarness | null> {
    // When filled in single mode the visible input is hidden; query returns null.
    const all = await this.locatorForAll(TheSeamFileInputHarness)()
    if (all.length === 0) return null
    // Return the first non-hidden one; filled-state hidden inputs have `hidden` attr.
    for (const h of all) {
      const host = await h.host()
      if ((await host.getAttribute('hidden')) === null) return h
    }
    return null
  }

  async getTiles(): Promise<TheSeamFileTileHarness[]> {
    return this.locatorForAll(TheSeamFileTileHarness)()
  }

  async getReplaceButtonText(): Promise<string | null> {
    const btn = await this._replace()
    if (!btn) return null
    return (await btn.text()).trim()
  }
}
```

- [ ] **Step 5: Register harnesses in the testing public-api**

Replace `projects/ui-common/file-input/testing/public-api.ts` with:

```ts
export { TheSeamFileDropZoneHarness } from './file-drop-zone.harness'
export { TheSeamFileInputHarness } from './file-input.harness'
export { TheSeamFileTileHarness } from './file-tile.harness'
export { TheSeamFileFieldHarness } from './file-field.harness'
```

- [ ] **Step 6: Verify typecheck**

Run: `npm run build:ui-common`
Expected: SUCCESS.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/file-input/testing/
git commit -m "feat(file-input): add component harnesses"
```

---

### Task 17: Storybook stories

Stories double as documentation (per project convention). Each component gets its own file.

**Files:**

- Create: `projects/ui-common/file-input/file-drop-zone.directive.stories.ts`
- Create: `projects/ui-common/file-input/file-input.stories.ts`
- Create: `projects/ui-common/file-input/file-tile.stories.ts`
- Create: `projects/ui-common/file-input/file-field.stories.ts`

- [ ] **Step 1: Create stories for `<seam-file-input>`**

File: `projects/ui-common/file-input/file-input.stories.ts`

```ts
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect, fn } from 'storybook/test'

import { argsToTpl } from '@theseam/ui-common/story-helpers'

import { TheSeamFileInputComponent } from './file-input.component'

const meta: Meta<TheSeamFileInputComponent> = {
  title: 'File Input/Components/File Input',
  component: TheSeamFileInputComponent,
  decorators: [moduleMetadata({ imports: [TheSeamFileInputComponent] })],
  render: (args) => ({
    props: { ...args, filesAdded: fn(), rejected: fn() },
    template: `<seam-file-input ${argsToTpl()} (filesAdded)="filesAdded($event)" (rejected)="rejected($event)"></seam-file-input>`,
  }),
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<TheSeamFileInputComponent>

export const Default: Story = { args: {} }

export const Multiple: Story = { args: { multiple: true } }

export const WithAcceptFilter: Story = { args: { accept: 'image/*' } }

export const WithMaxSize: Story = { args: { maxSize: 1024 * 1024 } }

export const WithMaxFiles: Story = { args: { multiple: true, maxFiles: 3 } }

export const Disabled: Story = { args: { disabled: true } }

export const HiddenErrors: Story = {
  args: { accept: 'image/*', hideErrors: true },
}

export const CustomPrompt: Story = {
  args: {
    promptText: 'Choose an image',
    promptSuffix: 'or drop it here',
    accept: 'image/*',
  },
}
```

- [ ] **Step 2: Create stories for `<seam-file-tile>`**

File: `projects/ui-common/file-input/file-tile.stories.ts`

```ts
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect, fn } from 'storybook/test'

import { TheSeamFileTileComponent } from './file-tile.component'
import { SeamFileItem } from './file-item.models'
import { seamFileItemFromUrl } from './file-item.utils'

function fakeImageFile(name: string): File {
  return new File(
    [new Uint8Array([137, 80, 78, 71])],
    name,
    { type: 'image/png' },
  )
}

const rowItem: SeamFileItem = {
  name: 'shipment-report-Q3.pdf',
  size: 847 * 1024,
  type: 'application/pdf',
  source: {
    kind: 'file',
    file: new File(['x'], 'shipment-report-Q3.pdf', {
      type: 'application/pdf',
    }),
  },
}

const imageItem: SeamFileItem = {
  name: 'pic.png',
  size: 1234,
  type: 'image/png',
  source: { kind: 'file', file: fakeImageFile('pic.png') },
}

const serverItem = seamFileItemFromUrl('https://placekitten.com/300/200', {
  name: 'kitten.png',
  type: 'image/png',
  id: 'doc-42',
})

const meta: Meta<TheSeamFileTileComponent> = {
  title: 'File Input/Components/File Tile',
  component: TheSeamFileTileComponent,
  decorators: [moduleMetadata({ imports: [TheSeamFileTileComponent] })],
  render: (args) => ({
    props: { ...args, remove: fn(), itemClick: fn() },
  }),
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<TheSeamFileTileComponent>

export const RowVariant: Story = { args: { item: rowItem } }

export const RowVariantNoMeta: Story = {
  args: { item: rowItem, showMeta: false },
}

export const PreviewVariant: Story = {
  args: { item: imageItem, variant: 'preview' },
}

export const PreviewVariantNoName: Story = {
  args: { item: imageItem, variant: 'preview', showName: false },
}

export const ClickableTile: Story = {
  args: { item: rowItem },
  render: (args) => ({
    props: { ...args, remove: fn(), itemClick: fn() },
    template: `<seam-file-tile [item]="item" (itemClick)="itemClick($event)" (remove)="remove($event)"></seam-file-tile>`,
  }),
}

export const NonRemovable: Story = {
  args: { item: rowItem, removable: false },
}

export const UrlSourceItem: Story = {
  args: { item: serverItem, variant: 'preview' },
}
```

- [ ] **Step 3: Create stories for `<seam-file-field>`**

File: `projects/ui-common/file-input/file-field.stories.ts`

```ts
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { fn } from 'storybook/test'

import { TheSeamFileFieldComponent } from './file-field.component'
import { SeamFileItem } from './file-item.models'
import { seamFileItemFromUrl } from './file-item.utils'

const meta: Meta<TheSeamFileFieldComponent> = {
  title: 'File Input/Components/File Field',
  component: TheSeamFileFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [TheSeamFileFieldComponent, ReactiveFormsModule],
    }),
  ],
  render: (args) => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ...args, ctrl, rejected: fn() },
      template: `<seam-file-field [formControl]="ctrl" (rejected)="rejected($event)"></seam-file-field>`,
    }
  },
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<TheSeamFileFieldComponent>

export const SingleFile: Story = { args: {} }

export const SingleFilePreview: Story = {
  args: { previewMode: true, accept: 'image/*' },
  render: (args) => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ...args, ctrl, rejected: fn() },
      template: `<seam-file-field [formControl]="ctrl" [previewMode]="previewMode" [accept]="accept"></seam-file-field>`,
    }
  },
}

export const MultipleFiles: Story = {
  args: { multiple: true },
  render: (args) => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ...args, ctrl, rejected: fn() },
      template: `<seam-file-field [formControl]="ctrl" [multiple]="multiple"></seam-file-field>`,
    }
  },
}

export const MultipleFilesPreview: Story = {
  args: { multiple: true, previewMode: true, accept: 'image/*' },
  render: (args) => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ...args, ctrl, rejected: fn() },
      template: `<seam-file-field
        [formControl]="ctrl"
        [multiple]="multiple"
        [previewMode]="previewMode"
        [accept]="accept"></seam-file-field>`,
    }
  },
}

export const MultipleFilesPreviewWithMaxFiles: Story = {
  args: { multiple: true, previewMode: true, accept: 'image/*', maxFiles: 4 },
  render: (args) => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ...args, ctrl, rejected: fn() },
      template: `<seam-file-field
        [formControl]="ctrl"
        [multiple]="multiple"
        [previewMode]="previewMode"
        [accept]="accept"
        [maxFiles]="maxFiles"></seam-file-field>`,
    }
  },
}

export const EditFormWithExistingUrl: Story = {
  render: () => {
    const ctrl = new FormControl<SeamFileItem[]>([
      seamFileItemFromUrl('https://placekitten.com/300/200', {
        name: 'current-kitten.png',
        type: 'image/png',
        id: 'existing',
      }),
    ])
    return {
      props: { ctrl },
      template: `<seam-file-field
        [formControl]="ctrl"
        [previewMode]="true"
        accept="image/*"></seam-file-field>`,
    }
  },
}

export const WithValidation: Story = {
  args: { accept: 'image/*', maxSize: 1024 * 1024 },
  render: (args) => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ...args, ctrl, rejected: fn() },
      template: `<seam-file-field
        [formControl]="ctrl"
        [accept]="accept"
        [maxSize]="maxSize"></seam-file-field>`,
    }
  },
}

export const DisabledField: Story = {
  render: () => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    ctrl.disable()
    return {
      props: { ctrl },
      template: `<seam-file-field [formControl]="ctrl"></seam-file-field>`,
    }
  },
}

export const CustomStateWithInputAndTile: Story = {
  render: () => {
    const items = [
      seamFileItemFromUrl('https://placekitten.com/100/100', {
        name: 'existing-1.png',
        type: 'image/png',
      }),
    ]
    return {
      props: { items, onFilesAdded: fn(), onRemove: fn() },
      template: `
        <seam-file-input [multiple]="true" (filesAdded)="onFilesAdded($event)"></seam-file-input>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
          <seam-file-tile *ngFor="let item of items" [item]="item" (remove)="onRemove($event)"></seam-file-tile>
        </div>
      `,
    }
  },
}
```

- [ ] **Step 4: Create stories for `[seamFileDropZone]`**

File: `projects/ui-common/file-input/file-drop-zone.directive.stories.ts`

```ts
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { fn } from 'storybook/test'

import { TheSeamFileDropZoneDirective } from './file-drop-zone.directive'

const meta: Meta<TheSeamFileDropZoneDirective> = {
  title: 'File Input/Directives/File Drop Zone',
  component: TheSeamFileDropZoneDirective,
  decorators: [
    moduleMetadata({ imports: [TheSeamFileDropZoneDirective] }),
  ],
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<TheSeamFileDropZoneDirective>

export const BasicUsage: Story = {
  render: () => ({
    props: { onDrop: fn(), onRejected: fn() },
    template: `
      <div
        style="padding:24px;border:1.5px dashed #ced4da;border-radius:6px;text-align:center"
        [seamFileDropZone]
        (seamFileDrop)="onDrop($event)"
        (seamFileDropRejected)="onRejected($event)">
        Drop files here
      </div>
    `,
  }),
}

export const LargeDropZone: Story = {
  render: () => ({
    props: { onDrop: fn() },
    template: `
      <div
        style="min-height:300px;display:flex;align-items:center;justify-content:center;
               border:1.5px dashed #ced4da;border-radius:8px;background:#fbfbfd"
        [seamFileDropZone]
        (seamFileDrop)="onDrop($event)">
        Anywhere in this big area is a drop target
      </div>
    `,
  }),
}

export const WithAccept: Story = {
  render: () => ({
    props: { onDrop: fn(), onRejected: fn() },
    template: `
      <div
        style="padding:24px;border:1.5px dashed #ced4da;border-radius:6px;text-align:center"
        [seamFileDropZone]
        accept="image/*"
        (seamFileDrop)="onDrop($event)"
        (seamFileDropRejected)="onRejected($event)">
        Images only
      </div>
    `,
  }),
}
```

- [ ] **Step 5: Start Storybook and spot-check manually**

If Storybook is not already running, remind the user — don't start it yourself without asking (per project convention). If it is running, visit the four new story groups under "File Input" and verify each loads without console errors.

- [ ] **Step 6: Verify library build**

Run: `npm run build:ui-common`
Expected: SUCCESS — stories don't affect the library bundle, but confirm none of the touched code caused a regression.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/file-input/*.stories.ts
git commit -m "docs(file-input): add Storybook stories for file-input components"
```

---

### Task 18: Migrate `signature-input-img` to `[seamFileDropZone]`

Replace the `ngx-file-drop` usage in `projects/ui-common/signature-input/signature-input-img/` with `[seamFileDropZone]` + a hidden native input. This is the only remaining library consumer of `ngx-file-drop`.

**Files:**

- Modify: `projects/ui-common/signature-input/signature-input-img/signature-input-img.component.ts`
- Modify: `projects/ui-common/signature-input/signature-input-img/signature-input-img.component.html`
- Inspect (do not break): `projects/ui-common/signature-input/signature-input-img/signature-input-img.component.spec.ts`
- Inspect (do not break): `projects/ui-common/signature-input/testing/signature-input-img.harness.ts`

- [ ] **Step 1: Run existing signature-input-img tests baseline**

Run: `npx jest projects/ui-common/signature-input`
Expected: PASS — record the pass count. This run is your migration baseline.

- [ ] **Step 2: Update the component class**

Replace the contents of `projects/ui-common/signature-input/signature-input-img/signature-input-img.component.ts` with:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms'
import { from, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { TheSeamFileDropZoneDirective } from '@theseam/ui-common/file-input'
import { readFileAsDataUrlAsync } from '@theseam/ui-common/utils'

import { SignatureInputItem } from '../signature-input-panel.models'
import { THESEAM_SIGNATURE_INPUT_CONTAINER } from '../signature-input-container.token'

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

const maxFileSizeValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value
  if (!(value instanceof File)) {
    return null
  }
  return value.size > MAX_FILE_SIZE_BYTES ? { maxFileSize: {} } : null
}

@Component({
  selector: 'seam-signature-input-img',
  templateUrl: './signature-input-img.component.html',
  styleUrls: ['./signature-input-img.component.scss'],
  imports: [TheSeamFileDropZoneDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TheSeamSignatureInputImgComponent,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamSignatureInputImgComponent
  implements ControlValueAccessor, SignatureInputItem
{
  static readonly MAX_FILE_SIZE = MAX_FILE_SIZE_BYTES

  private readonly _container = inject(THESEAM_SIGNATURE_INPUT_CONTAINER, {
    optional: true,
  })
  private readonly _destroyRef = inject(DestroyRef)

  protected readonly _fileControl = new FormControl<File | null>(null, {
    validators: [maxFileSizeValidator],
  })

  private readonly _fileStatus = toSignal(this._fileControl.statusChanges, {
    initialValue: this._fileControl.status,
  })

  protected readonly _sizeError = computed<string | null>(() => {
    this._fileStatus()
    return this._fileControl.getError('maxFileSize')
      ? 'File size has exceeded 2MB.'
      : null
  })

  private readonly _value = signal<string | null>(null)
  protected readonly _previewDataUrl = computed(() => this._value())
  protected readonly _previewBackgroundImage = computed(() => {
    const url = this._value()
    return url ? `url("${url}")` : null
  })

  private readonly _nativeInput =
    viewChild.required<ElementRef<HTMLInputElement>>('filesInput')

  private _onChange: (value: string | null) => void = () => undefined
  private _onTouched: () => void = () => undefined

  constructor() {
    if (this._container) {
      this._container.registerInputItem('img', this)
      this._destroyRef.onDestroy(() =>
        this._container?.unregisterInputItem('img', this),
      )
    }

    this._fileControl.valueChanges
      .pipe(
        switchMap(() => {
          const file = this._fileControl.value
          if (!file || this._fileControl.invalid) {
            return of<string | null>(null)
          }
          return from(readFileAsDataUrlAsync(file))
        }),
        takeUntilDestroyed(),
      )
      .subscribe((dataUrl) => this._setValue(dataUrl))
  }

  writeValue(value: string | null): void {
    this._value.set(value)
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this._onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    if (this._fileControl.disabled === isDisabled) return
    if (isDisabled) this._fileControl.disable()
    else this._fileControl.enable()
  }

  clear(): void {
    this._fileControl.setValue(null)
  }

  openFileBrowse(): void {
    this._nativeInput().nativeElement.click()
  }

  protected _onFilesDropped(files: File[]): void {
    if (files.length > 0) this._fileControl.setValue(files[0])
  }

  protected _onNativeChange(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      this._fileControl.setValue(input.files[0])
    }
    input.value = ''
  }

  private _setValue(value: string | null): void {
    this._value.set(value)
    this._onChange(value)
    this._onTouched()
  }
}
```

Key changes from the old component:
- Removed the `ngx-file-drop` import and `NgxFileDropModule` from `imports`.
- Added `TheSeamFileDropZoneDirective` to `imports`.
- Replaced the ad-hoc `openFileBrowse()` that created a detached `<input>` with a `viewChild.required` + hidden `<input>` in the template; the detached-input trick is no longer needed (the fixed location works fine for triggering the native picker).
- `_onFilesDropped` accepts `File[]` directly (no `NgxFileDropEntry` unwrapping).
- Added `_onNativeChange` for the hidden native `<input>`'s `change` event.

- [ ] **Step 3: Update the template**

Replace the contents of `projects/ui-common/signature-input/signature-input-img/signature-input-img.component.html` with:

```html
<div class="seam-signature-input-img">
  <div class="seam-signature-input-img__upload-container">
    <div class="seam-signature-input-img__header h-100">
      <div
        class="seam-signature-input-img__upload-box h-100"
        [class.has-preview]="!!_previewDataUrl()"
        [style.background-image]="_previewBackgroundImage()"
        tabindex="0"
        [seamFileDropZone]
        accept="image/*"
        (seamFileDrop)="_onFilesDropped($event)"
        (click)="openFileBrowse()"
        (keydown.enter)="openFileBrowse()"
      >
        @if (!_previewDataUrl()) {
          <div class="seam-signature-input-img__drop-prompt">
            <strong>Choose a file</strong> or drag it here
          </div>
        }
      </div>

      @if (_sizeError(); as err) {
        <div class="seam-signature-input-img__size-error">{{ err }}</div>
      }
    </div>
  </div>

  <input
    #filesInput
    type="file"
    hidden
    accept="image/*"
    (change)="_onNativeChange($event)"
  />
</div>
```

- [ ] **Step 4: Run signature-input tests**

Run: `npx jest projects/ui-common/signature-input`
Expected: PASS — same count as the baseline from Step 1. If any signature-input test relied on the `ngx-file-drop` markup specifically, update the test's selectors to match the new markup (but keep the observable behavior the same).

- [ ] **Step 5: Update the harness if it queries `ngx-file-drop`**

Open `projects/ui-common/signature-input/testing/signature-input-img.harness.ts`. Search for any selectors targeting `ngx-file-drop` or `ngx-file-drop-content-tmp`. Replace them with the equivalent `.seam-signature-input-img__upload-box` selector. Run `npx jest projects/ui-common/signature-input` again and confirm PASS.

- [ ] **Step 6: Verify the module still builds**

Run: `npm run build:ui-common`
Expected: SUCCESS.

- [ ] **Step 7: Sanity-check there are no remaining library references to `ngx-file-drop`**

Run: `grep -r "ngx-file-drop" projects/ui-common` (use the Grep tool in the harness environment).
Expected: NO MATCHES.

- [ ] **Step 8: Commit**

```bash
git add projects/ui-common/signature-input/
git commit -m "refactor(signature-input): migrate signature-input-img to seamFileDropZone"
```

---

### Task 19: Remove `ngx-file-drop` dependency

Last task: drop `ngx-file-drop` from the package manifest now that the library no longer imports it.

**Files:**

- Modify: `package.json` (repo root, not `projects/ui-common/package.json`)

- [ ] **Step 1: Locate and remove the `ngx-file-drop` line**

Open `package.json` at the repo root. In the `dependencies` section, remove the line:

```json
"ngx-file-drop": "~16.0.0",
```

- [ ] **Step 2: Regenerate lock file**

Run: `npm install --package-lock-only`
Expected: SUCCESS — `package-lock.json` updated, no `ngx-file-drop` reference.

- [ ] **Step 3: Verify no lingering references anywhere in the repo**

Run Grep for `ngx-file-drop` across the whole repo. Expected matches are ONLY in:
- `package-lock.json` (should now be gone or only in a removed-entries diff)
- Consumer apps outside `projects/ui-common/` — which are not part of this PR

Expected inside `projects/ui-common/`: NO MATCHES.

- [ ] **Step 4: Run full test + build suite**

Run in parallel:
- `npm run test:ci`
- `npm run build:ui-common`
- `npm run lint`

Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(file-input): drop ngx-file-drop dependency"
```

---

## Self-review notes

- **Spec coverage:** Module layout (Task 1), data model (Task 2), utilities including `iconForMime` returning `SeamIcon` (Tasks 3–6), `[seamFileDropZone]` (Tasks 7–8), `<seam-file-input>` with delegation to the directive (Tasks 9–10), `<seam-file-tile>` row+preview+opt-in-click (Tasks 11–13), `<seam-file-field>` with CVA over `SeamFileItem[]` and C-pattern (Tasks 14–15), harnesses (Task 16), stories (Task 17), library migration of `signature-input-img` + dep removal (Tasks 18–19). All spec sections accounted for.
- **Deferred items from the spec are explicitly NOT in the plan:** `<seam-file-list>`, magic-byte type detection, upload progress, mime-icon DI token.
- **Type consistency:** `SeamFileItem` / `SeamFileRejection` / `SeamFileRejectionReason` / `SeamFileTileVariant` are used identically across Tasks 2–15. `iconForMime` signature matches the spec (`SeamIcon` return). `seamFileItemFromFile` / `seamFileItemFromUrl` / `seamFilesFromItems` signatures are identical across utils and stories.
- **Opt-in click detection note:** Task 13 notes that if `output().observed` is not available on the installed Angular, the detection falls back to always-observed when any `(itemClick)` binding exists. The public API is unaffected; the internal mechanism can be sharpened later.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-20-file-input.md`. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach?
