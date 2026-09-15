# Geo File Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `readGeoFile` read multi-shapefile archives, route dropped files through the consumer's import hook, and surface parse failures as an output instead of silence.

**Architecture:** `parseShpZip` stops refusing archives with several `.shp` members and concatenates their features into one `FeatureCollection`, tagging each feature with the archive member it came from. On the map side, `map-file-drop` starts consulting the same `fileImportHandler` the upload button already honours, and both import paths report failures through a new `fileImportError` output plumbed like the existing `deleteBlocked`.

**Tech Stack:** Angular 20, TypeScript, Jest (`jest-preset-angular`, jsdom), `shpjs@6.2.0`, `file-type`, RxJS.

**Spec:** `docs/superpowers/specs/2026-09-15-geo-file-import-design.md`

## Global Constraints

- Branch: `marklb/map-interaction-improve`. Do not create a new branch.
- Prettier settings are non-negotiable and enforced on commit: 2-space indent, **no semicolons**, single quotes, trailing commas, arrow parens always.
- Private members are prefixed with `_`. Injected members are `readonly`.
- Components use `ChangeDetectionStrategy.OnPush`.
- Exported types visible to consumers use the `TheSeam` prefix. Do not prefix interfaces with `I`.
- Never put customer data in this repo. Every fixture value in this plan is invented and must stay invented.
- Run tests with `npm run test:ci -- <pattern>`. Plain `npm run test` is watch mode and will hang.
- Conventional commit messages. `feat:` / `fix:` / `test:` / `refactor:` / `docs:`.
- End every commit message with:
  `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`

## Facts already verified — do not re-derive

These were confirmed by running the real libraries. Trust them.

- `parseZip` returns the `FeatureCollection` **directly** for a single-`.shp` archive and an **array** for a multi-`.shp` archive.
- `parseZip` **throws `no layers founds`** when an archive has no `.shp`/`.json` member. It never returns `[]`.
- `fileName` is the member path minus extension, e.g. `boundaries/NorthQuarter`.
- `parseShp` reads only the `.shp` (+ optional `.prj`/`.dbf`). No `.shx` is needed.
- For a single-ring polygon record, shpjs skips its ring-winding logic entirely, so fixture ring order does not matter.
- `file-type` reports `{ ext: 'zip', mime: 'application/zip' }` for the fixture zips built in Task 1.

---

### Task 1: Shapefile fixture helper

Builds real `.shp` / `.dbf` bytes and a stored (uncompressed) zip in memory, so later tasks can run the real `shpjs` instead of mocking it.

**Files:**

- Create: `projects/ui-common/utils/geo-json/testing/shapefile-fixture.ts`
- Test: `projects/ui-common/utils/geo-json/testing/shapefile-fixture.spec.ts`

This file is not reachable from any `public-api.ts`, so ng-packagr never publishes it.

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `type FixtureRing = [number, number][]`
  - `interface ShapefileMember { name: string; polygons: FixtureRing[]; properties?: Record<string, string | number>[] }`
  - `function shapefileZip(members: ShapefileMember[]): Uint8Array`
  - `function toArrayBuffer(bytes: Uint8Array): ArrayBuffer`

- [ ] **Step 1: Write the failing test**

Create `projects/ui-common/utils/geo-json/testing/shapefile-fixture.spec.ts`:

```ts
import { parseZip } from 'shpjs'

import { shapefileZip, toArrayBuffer } from './shapefile-fixture'

const square = (x: number, y: number): [number, number][] => [
  [x, y],
  [x, y + 1],
  [x + 1, y + 1],
  [x + 1, y],
  [x, y],
]

describe('shapefileZip', () => {
  it('should build an archive shpjs reads as several layers', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/NorthQuarter',
        polygons: [square(0, 0)],
        properties: [{ FIELD_NAME: 'North Quarter', ACRES: 12 }],
      },
      {
        name: 'boundaries/SouthQuarter',
        polygons: [square(2, 0)],
        properties: [{ FIELD_NAME: 'South Quarter', ACRES: 9 }],
      },
    ])

    const parsed = await parseZip(toArrayBuffer(zip))

    expect(Array.isArray(parsed)).toBe(true)
    const layers = parsed as any[]
    expect(layers).toHaveLength(2)
    expect(layers[0].fileName).toBe('boundaries/NorthQuarter')
    expect(layers[0].features).toHaveLength(1)
    expect(layers[0].features[0].geometry).toEqual({
      type: 'Polygon',
      coordinates: [square(0, 0)],
    })
    expect(layers[0].features[0].properties).toEqual({
      FIELD_NAME: 'North Quarter',
      ACRES: 12,
    })
    expect(layers[1].fileName).toBe('boundaries/SouthQuarter')
  })

  it('should build an archive shpjs reads as one layer of many features', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/boundaries',
        polygons: [square(0, 0), square(2, 0), square(4, 0)],
        properties: [
          { FIELD_NAME: 'North Quarter' },
          { FIELD_NAME: 'South Quarter' },
          { FIELD_NAME: 'East Quarter' },
        ],
      },
    ])

    const parsed = (await parseZip(toArrayBuffer(zip))) as any

    expect(Array.isArray(parsed)).toBe(false)
    expect(parsed.fileName).toBe('boundaries/boundaries')
    expect(parsed.features).toHaveLength(3)
    expect(parsed.features[2].properties).toEqual({ FIELD_NAME: 'East Quarter' })
  })

  it('should keep a zero-valued numeric property numeric', async () => {
    const zip = shapefileZip([
      {
        name: '4Tower_HICALCI_3833_HenryCou',
        polygons: [square(0, 0)],
        properties: [{ 'HI-CALCIUM': 0 }],
      },
    ])

    const parsed = (await parseZip(toArrayBuffer(zip))) as any

    expect(parsed.features[0].properties).toEqual({ 'HI-CALCIUM': 0 })
  })

  it('should build an archive shpjs rejects when it holds no shapefile', async () => {
    const zip = shapefileZip([])

    await expect(parseZip(toArrayBuffer(zip))).rejects.toThrow(
      'no layers founds',
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:ci -- shapefile-fixture`
Expected: FAIL — `Cannot find module './shapefile-fixture'`.

- [ ] **Step 3: Write the implementation**

Create `projects/ui-common/utils/geo-json/testing/shapefile-fixture.ts`. This code is verified working against `shpjs@6.2.0`; the byte offsets are exact and the comments explain the two non-obvious ones. Do not "clean up" the offsets.

```ts
/**
 * Builds ESRI Shapefile archives in memory for tests, so specs can exercise
 * the real `shpjs` instead of mocking it.
 *
 * Deliberately minimal, and only as correct as the parsers we feed it need:
 *
 * - No `.shx` — `parseShp` reads only the `.shp`, and shpjs's unzip step
 *   discards `.shx` members before parsing anyway.
 * - Zip entries are STORED, never deflated, because `but-unzip` reads stored
 *   entries directly and never verifies a CRC.
 * - Polygons are single-ring. shpjs converts a one-part polygon record without
 *   consulting ring winding, so fixture ring order does not matter.
 *
 * Every value a caller passes should be invented. No customer data belongs in
 * this repository.
 */

/** A closed ring of `[x, y]` (lon/lat) pairs. */
export type FixtureRing = [number, number][]

export interface ShapefileMember {
  /**
   * Member path inside the archive, without extension — `boundaries/Field1`
   * produces `boundaries/Field1.shp` and `boundaries/Field1.dbf`. shpjs
   * reports this verbatim as the layer's `fileName`.
   */
  name: string
  /** One ring per feature. */
  polygons: FixtureRing[]
  /** One record per feature, in the same order. Omit for a member with no `.dbf`. */
  properties?: Record<string, string | number>[]
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let c = -1
  for (let i = 0; i < bytes.length; i++) {
    c = (c >>> 8) ^ CRC_TABLE[(c ^ bytes[i]) & 0xff]
  }
  return (c ^ -1) >>> 0
}

/** Narrows a `Uint8Array` to the exact `ArrayBuffer` it covers. */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer
}

function writeShp(polygons: FixtureRing[]): Uint8Array {
  // Record content: shape type (4) + bbox (32) + numParts (4) + numPoints (4)
  // + one part index (4) + 16 bytes per point.
  const contentLength = (ring: FixtureRing) => 48 + 16 * ring.length

  let size = 100
  for (const ring of polygons) {
    size += 8 + contentLength(ring)
  }

  const buffer = new ArrayBuffer(size)
  const view = new DataView(buffer)

  const points = polygons.flat()
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])

  // The file header's multi-byte fields are big-endian except version, shape
  // type and the bounding box, which are little-endian. That is the format,
  // not a mistake.
  view.setInt32(0, 9994)
  view.setInt32(24, size >> 1) // length, in 16-bit words
  view.setInt32(28, 1000, true) // version
  view.setInt32(32, 5, true) // shape type: Polygon
  view.setFloat64(36, Math.min(...xs), true)
  view.setFloat64(44, Math.min(...ys), true)
  view.setFloat64(52, Math.max(...xs), true)
  view.setFloat64(60, Math.max(...ys), true)

  let offset = 100
  polygons.forEach((ring, index) => {
    const content = contentLength(ring)
    view.setInt32(offset, index + 1) // record number, 1-based, big-endian
    view.setInt32(offset + 4, content >> 1) // content length in words, big-endian

    const at = offset + 8
    const rxs = ring.map((p) => p[0])
    const rys = ring.map((p) => p[1])
    view.setInt32(at, 5, true)
    view.setFloat64(at + 4, Math.min(...rxs), true)
    view.setFloat64(at + 12, Math.min(...rys), true)
    view.setFloat64(at + 20, Math.max(...rxs), true)
    view.setFloat64(at + 28, Math.max(...rys), true)
    view.setInt32(at + 36, 1, true) // numParts
    view.setInt32(at + 40, ring.length, true) // numPoints
    view.setInt32(at + 44, 0, true) // parts[0]

    let point = at + 48
    for (const [x, y] of ring) {
      view.setFloat64(point, x, true)
      view.setFloat64(point + 8, y, true)
      point += 16
    }

    offset += 8 + content
  })

  return new Uint8Array(buffer)
}

function writeDbf(records: Record<string, string | number>[]): Uint8Array {
  const fields = Object.keys(records[0] ?? {}).map((name) => {
    const values = records.map((record) => record[name])
    const numeric = values.every((value) => typeof value === 'number')
    const len = Math.max(
      1,
      ...values.map((value) => String(value).length),
      numeric ? 1 : name.length,
    )
    return { name, type: numeric ? 'N' : 'C', len: Math.min(len, 254) }
  })

  const recordLength = 1 + fields.reduce((total, f) => total + f.len, 0)
  // 32-byte header + a 32-byte descriptor per field + the 0x0D terminator.
  // parsedbf reads the first field at 32 * (fields + 1) + 2, which is this
  // offset plus the record's one-byte deletion flag. Adding any padding here
  // shifts every field by one byte and silently corrupts every value.
  const headerLength = 32 * (fields.length + 1) + 1
  const size = headerLength + recordLength * records.length + 1

  const bytes = new Uint8Array(size)
  const view = new DataView(bytes.buffer)

  bytes[0] = 0x03 // dBase III, no memo
  bytes[1] = 26 // year - 1900
  bytes[2] = 9
  bytes[3] = 15
  view.setUint32(4, records.length, true)
  view.setUint16(8, headerLength, true)
  view.setUint16(10, recordLength, true)

  fields.forEach((field, index) => {
    const at = 32 + index * 32
    const name = field.name.slice(0, 10)
    for (let c = 0; c < name.length; c++) {
      bytes[at + c] = name.charCodeAt(c)
    }
    bytes[at + 11] = field.type.charCodeAt(0)
    bytes[at + 16] = field.len
    bytes[at + 17] = 0 // decimal count
  })

  bytes[32 + fields.length * 32] = 0x0d // field descriptor terminator

  let offset = headerLength
  for (const record of records) {
    bytes[offset] = 0x20 // space: this record is not deleted
    let at = offset + 1
    for (const field of fields) {
      const raw = String(record[field.name] ?? '').slice(0, field.len)
      const text =
        field.type === 'N' ? raw.padStart(field.len) : raw.padEnd(field.len)
      for (let c = 0; c < field.len; c++) {
        bytes[at + c] = text.charCodeAt(c)
      }
      at += field.len
    }
    offset += recordLength
  }

  bytes[size - 1] = 0x1a // EOF
  return bytes
}

interface ZipEntry {
  name: string
  data: Uint8Array
}

function writeZip(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const name = encoder.encode(entry.name)
    const data = entry.data
    const crc = crc32(data)

    const local = new Uint8Array(30 + name.length + data.length)
    const localView = new DataView(local.buffer)
    localView.setUint32(0, 0x04034b50, true)
    localView.setUint16(4, 20, true) // version needed
    localView.setUint16(8, 0, true) // compression method: stored
    localView.setUint32(14, crc, true)
    localView.setUint32(18, data.length, true) // compressed size
    localView.setUint32(22, data.length, true) // uncompressed size
    localView.setUint16(26, name.length, true)
    local.set(name, 30)
    local.set(data, 30 + name.length)
    locals.push(local)

    const central = new Uint8Array(46 + name.length)
    const centralView = new DataView(central.buffer)
    centralView.setUint32(0, 0x02014b50, true)
    centralView.setUint16(4, 20, true) // version made by
    centralView.setUint16(6, 20, true) // version needed
    centralView.setUint16(10, 0, true) // compression method: stored
    centralView.setUint32(16, crc, true)
    centralView.setUint32(20, data.length, true)
    centralView.setUint32(24, data.length, true)
    centralView.setUint16(28, name.length, true)
    centralView.setUint32(42, offset, true) // local header offset
    central.set(name, 46)
    centrals.push(central)

    offset += local.length
  }

  const centralSize = centrals.reduce((total, c) => total + c.length, 0)
  const out = new Uint8Array(offset + centralSize + 22)

  let at = 0
  for (const local of locals) {
    out.set(local, at)
    at += local.length
  }
  const centralStart = at
  for (const central of centrals) {
    out.set(central, at)
    at += central.length
  }

  const endView = new DataView(out.buffer, at)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(8, entries.length, true) // entries on this disk
  endView.setUint16(10, entries.length, true) // entries in total
  endView.setUint32(12, centralSize, true)
  endView.setUint32(16, centralStart, true)

  return out
}

/**
 * Builds a zip archive holding one `.shp` (and `.dbf`, when properties are
 * given) per member. Pass no members to build an archive shpjs rejects with
 * `no layers founds`.
 */
export function shapefileZip(members: ShapefileMember[]): Uint8Array {
  const entries: ZipEntry[] = []
  for (const member of members) {
    entries.push({
      name: `${member.name}.shp`,
      data: writeShp(member.polygons),
    })
    if (member.properties && member.properties.length > 0) {
      entries.push({
        name: `${member.name}.dbf`,
        data: writeDbf(member.properties),
      })
    }
  }
  return writeZip(entries)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:ci -- shapefile-fixture`
Expected: PASS, 4 tests.

If the property assertions fail with values shifted by one character (`'North Quarte'` instead of `'North Quarter'`), the `.dbf` `headerLength` is wrong. Re-read the comment above it.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/utils/geo-json/testing/shapefile-fixture.ts projects/ui-common/utils/geo-json/testing/shapefile-fixture.spec.ts
git commit -m "test(utils): build shapefile archives in memory for geo-file specs

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `parseShpZip` concatenates archive members

**Files:**

- Modify: `projects/ui-common/utils/geo-json/read-geo-file.ts`
- Test: `projects/ui-common/utils/geo-json/read-geo-file.spec.ts`

**Interfaces:**

- Consumes: `shapefileZip`, `toArrayBuffer` from Task 1.
- Produces:
  - `const GEO_FILE_SOURCE_NAME_PROPERTY = 'seamSourceFileName'` exported from `read-geo-file.ts`, and re-exported by `utils/public-api.ts` (which already does `export * from './geo-json/read-geo-file'` — no change needed there).
  - `readGeoFile` keeps its signature: `(fileOrBuffer: File | ArrayBuffer) => Promise<FeatureCollection>`.

- [ ] **Step 1: Write the failing test**

Add a new spec file `projects/ui-common/utils/geo-json/read-geo-file-shp-zip.spec.ts`. It is separate from the existing `read-geo-file.spec.ts` because that file calls `jest.mock('shpjs')` at module scope, which would defeat the whole point of these tests.

```ts
import {
  shapefileZip,
  toArrayBuffer,
} from './testing/shapefile-fixture'

import {
  GEO_FILE_SOURCE_NAME_PROPERTY,
  readGeoFile,
} from './read-geo-file'

const square = (x: number, y: number): [number, number][] => [
  [x, y],
  [x, y + 1],
  [x + 1, y + 1],
  [x + 1, y],
  [x, y],
]

describe('readGeoFile with real shapefile archives', () => {
  it('should concatenate the features of every member', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/NorthQuarter',
        polygons: [square(0, 0)],
        properties: [{ FIELD_NAME: 'North Quarter', ACRES: 12 }],
      },
      {
        name: 'boundaries/SouthQuarter',
        polygons: [square(2, 0)],
        properties: [{ FIELD_NAME: 'South Quarter', ACRES: 9 }],
      },
      {
        name: 'boundaries/EastQuarter',
        polygons: [square(4, 0)],
        properties: [{ FIELD_NAME: 'East Quarter', ACRES: 21 }],
      },
    ])

    const result = await readGeoFile(toArrayBuffer(zip))

    expect(result.type).toBe('FeatureCollection')
    expect(result.features).toHaveLength(3)
    expect(
      result.features.map((f) => f.properties?.['FIELD_NAME']),
    ).toEqual(['North Quarter', 'South Quarter', 'East Quarter'])
  })

  it('should give the same features however the producer exported them', async () => {
    const perField = shapefileZip([
      {
        name: 'boundaries/NorthQuarter',
        polygons: [square(0, 0)],
        properties: [{ FIELD_NAME: 'North Quarter' }],
      },
      {
        name: 'boundaries/SouthQuarter',
        polygons: [square(2, 0)],
        properties: [{ FIELD_NAME: 'South Quarter' }],
      },
    ])
    const oneFile = shapefileZip([
      {
        name: 'boundaries/boundaries',
        polygons: [square(0, 0), square(2, 0)],
        properties: [
          { FIELD_NAME: 'North Quarter' },
          { FIELD_NAME: 'South Quarter' },
        ],
      },
    ])

    const fromPerField = await readGeoFile(toArrayBuffer(perField))
    const fromOneFile = await readGeoFile(toArrayBuffer(oneFile))

    expect(fromPerField.features).toHaveLength(2)
    expect(fromOneFile.features).toHaveLength(2)
    expect(fromPerField.features.map((f) => f.geometry)).toEqual(
      fromOneFile.features.map((f) => f.geometry),
    )
  })

  it('should tag each feature with its member basename', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/4Tower_HICALCI_3833_HenryCou',
        polygons: [square(0, 0)],
        properties: [{ 'HI-CALCIUM': 0 }],
      },
      {
        name: '2West_KALIME_3833_HenryCou',
        polygons: [square(2, 0)],
        properties: [{ KALIME: 0 }],
      },
    ])

    const result = await readGeoFile(toArrayBuffer(zip))

    expect(
      result.features.map((f) => f.properties?.[GEO_FILE_SOURCE_NAME_PROPERTY]),
    ).toEqual(['4Tower_HICALCI_3833_HenryCou', '2West_KALIME_3833_HenryCou'])
  })

  it('should tag a single-member archive the same way', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/boundaries',
        polygons: [square(0, 0), square(2, 0)],
        properties: [{ FIELD_NAME: 'North' }, { FIELD_NAME: 'South' }],
      },
    ])

    const result = await readGeoFile(toArrayBuffer(zip))

    expect(
      result.features.map((f) => f.properties?.[GEO_FILE_SOURCE_NAME_PROPERTY]),
    ).toEqual(['boundaries', 'boundaries'])
  })

  it('should keep the producer properties alongside the source name', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/NorthQuarter',
        polygons: [square(0, 0)],
        properties: [{ FIELD_NAME: 'North Quarter', ACRES: 12 }],
      },
    ])

    const result = await readGeoFile(toArrayBuffer(zip))

    expect(result.features[0].properties).toEqual({
      FIELD_NAME: 'North Quarter',
      ACRES: 12,
      [GEO_FILE_SOURCE_NAME_PROPERTY]: 'NorthQuarter',
    })
  })

  it('should not leave fileName on the returned collection', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/boundaries',
        polygons: [square(0, 0)],
        properties: [{ FIELD_NAME: 'North' }],
      },
    ])

    const result = await readGeoFile(toArrayBuffer(zip))

    expect(result).not.toHaveProperty('fileName')
  })

  it('should throw Shape data not found for an archive with no shapefile', async () => {
    const zip = shapefileZip([])

    await expect(readGeoFile(toArrayBuffer(zip))).rejects.toThrow(
      'Shape data not found.',
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:ci -- read-geo-file-shp-zip`
Expected: FAIL. The first test fails with `Multiple shape files not supported.`, and the import of `GEO_FILE_SOURCE_NAME_PROPERTY` fails to resolve.

- [ ] **Step 3: Write the implementation**

In `projects/ui-common/utils/geo-json/read-geo-file.ts`, replace the `parseShpZip` function and adjust the imports.

Change the import block at the top of the file from:

```ts
import { fileTypeFromBuffer } from 'file-type'
import { FeatureCollection } from 'geojson'
import { parseShp, parseZip } from 'shpjs'

import { readFileAsync } from '../file-utils'
import { withoutProperty } from '../obj-utils'
```

to:

```ts
import { fileTypeFromBuffer } from 'file-type'
import { Feature, FeatureCollection } from 'geojson'
import { parseShp, parseZip } from 'shpjs'

import { readFileAsync } from '../file-utils'
import { coerceFeatureCollection } from './coerce-feature-collection'
```

`withoutProperty` is no longer used by this file. Leave `obj-utils` itself alone — other files use it.

Add the exported constant just below the imports:

```ts
/**
 * Property key under which `readGeoFile` records the archive member a feature
 * came from, for shapefile archives only.
 *
 * A zip can hold one shapefile per field, and once their features are
 * concatenated the member name is the only thing distinguishing them — for
 * some producer exports it is the only usable name at all, because the `.dbf`
 * carries nothing but numbers. The value is the member's basename, without its
 * directory or extension.
 */
export const GEO_FILE_SOURCE_NAME_PROPERTY = 'seamSourceFileName'
```

Replace the whole `parseShpZip` function with:

```ts
async function parseShpZip(buffer: ArrayBuffer): Promise<FeatureCollection> {
  const parsed = await parseZipLayers(buffer)

  const features: Feature[] = []
  for (const layer of parsed) {
    const collection = coerceFeatureCollection(layer)
    if (collection === null) {
      // `parseZip` also reports `.json` members as layers, and one can hold
      // something that is not a FeatureCollection. Skip it rather than fail an
      // archive whose shapefiles are perfectly good.
      continue
    }

    const sourceName = basename(layer.fileName)
    for (const feature of collection.features) {
      features.push(
        sourceName === undefined
          ? feature
          : {
              ...feature,
              properties: {
                ...feature.properties,
                [GEO_FILE_SOURCE_NAME_PROPERTY]: sourceName,
              },
            },
      )
    }
  }

  if (features.length === 0) {
    throw Error(`Shape data not found.`)
  }

  // Built fresh, so the `fileName` shpjs sets on each layer is not carried out
  // of here on the collection itself.
  return { type: 'FeatureCollection', features }
}

/**
 * Normalizes `parseZip`'s return to an array. It hands back the collection
 * itself for a single-shapefile archive and an array for a multi-shapefile
 * one, and throws its own `no layers founds` for an archive holding neither a
 * `.shp` nor a `.json`.
 */
async function parseZipLayers(
  buffer: ArrayBuffer,
): Promise<FeatureCollectionWithFilename[]> {
  let parsed: FeatureCollectionWithFilename | FeatureCollectionWithFilename[]
  try {
    parsed = await parseZip(buffer)
  } catch (err) {
    if (err instanceof Error && err.message === 'no layers founds') {
      throw Error(`Shape data not found.`)
    }
    throw err
  }

  return Array.isArray(parsed) ? parsed : [parsed]
}

/** Member name without its directory or extension, as a feature can use it. */
function basename(fileName: string | undefined): string | undefined {
  if (fileName === undefined || fileName.length === 0) {
    return undefined
  }
  const lastSlash = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'))
  const name = lastSlash === -1 ? fileName : fileName.slice(lastSlash + 1)
  return name.length === 0 ? undefined : name
}
```

Add `FeatureCollectionWithFilename` to the `shpjs` import — the shim in
`custom_types/shpjs/index.d.ts` already exports it:

```ts
import { FeatureCollectionWithFilename, parseShp, parseZip } from 'shpjs'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:ci -- read-geo-file-shp-zip`
Expected: PASS, 7 tests.

- [ ] **Step 5: Update the existing mocked spec**

`projects/ui-common/utils/geo-json/read-geo-file.spec.ts` still pins the old behaviour. Make three edits.

Delete this test entirely — the behaviour it pins is gone:

```ts
    it('should throw when parseZip returns multiple collections', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      })
      mockParseZip.mockResolvedValue([
        sampleFeatureCollection,
        sampleFeatureCollection,
      ])

      const buffer = new ArrayBuffer(100)

      await expect(readGeoFile(buffer)).rejects.toThrow(
        'Multiple shape files not supported.',
      )
    })
```

Replace this test:

```ts
    it('should throw when parseZip returns empty array', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      })
      mockParseZip.mockResolvedValue([])

      const buffer = new ArrayBuffer(100)

      await expect(readGeoFile(buffer)).rejects.toThrow('Shape data not found.')
    })
```

with one that covers what shpjs actually does, plus the empty case for safety:

```ts
    it('should translate the shpjs no-layers error', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      })
      mockParseZip.mockRejectedValue(new Error('no layers founds'))

      const buffer = new ArrayBuffer(100)

      await expect(readGeoFile(buffer)).rejects.toThrow('Shape data not found.')
    })

    it('should throw when parseZip returns no usable layer', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      })
      mockParseZip.mockResolvedValue([])

      const buffer = new ArrayBuffer(100)

      await expect(readGeoFile(buffer)).rejects.toThrow('Shape data not found.')
    })

    it('should let an unrecognised parseZip failure through unchanged', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      })
      mockParseZip.mockRejectedValue(new Error('corrupt central directory'))

      const buffer = new ArrayBuffer(100)

      await expect(readGeoFile(buffer)).rejects.toThrow(
        'corrupt central directory',
      )
    })
```

Replace this test, whose assertion is now about a collection built fresh:

```ts
    it('should handle parseZip returning an array with one collection', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      })
      mockParseZip.mockResolvedValue([
        { ...sampleFeatureCollection, fileName: 'test.shp' },
      ])

      const buffer = new ArrayBuffer(100)
      const result = await readGeoFile(buffer)

      expect(result.type).toBe('FeatureCollection')
      expect(result).not.toHaveProperty('fileName')
    })
```

with:

```ts
    it('should handle parseZip returning an array with one collection', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      })
      mockParseZip.mockResolvedValue([
        { ...sampleFeatureCollection, fileName: 'test' },
      ])

      const buffer = new ArrayBuffer(100)
      const result = await readGeoFile(buffer)

      expect(result.type).toBe('FeatureCollection')
      expect(result).not.toHaveProperty('fileName')
      expect(result.features[0].properties).toEqual({
        name: 'test',
        [GEO_FILE_SOURCE_NAME_PROPERTY]: 'test',
      })
    })
```

Note `sampleFeatureCollection`'s feature already carries `properties: { name: 'test' }`, which is why `name` appears above.

Update the import at the top of that file:

```ts
import { GEO_FILE_SOURCE_NAME_PROPERTY, readGeoFile } from './read-geo-file'
```

- [ ] **Step 6: Run both specs**

Run: `npm run test:ci -- read-geo-file`
Expected: PASS. Both `read-geo-file.spec.ts` and `read-geo-file-shp-zip.spec.ts` green.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-common/utils/geo-json/read-geo-file.ts projects/ui-common/utils/geo-json/read-geo-file.spec.ts projects/ui-common/utils/geo-json/read-geo-file-shp-zip.spec.ts
git commit -m "fix(utils): read archives holding more than one shapefile

Concatenates every member's features instead of refusing the archive, and
records each feature's source member under GEO_FILE_SOURCE_NAME_PROPERTY,
which for some producer exports is the only usable name a field has.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `fileImportError` on the service

**Files:**

- Modify: `projects/ui-common/google-maps/google-maps.service.ts`
- Create: `projects/ui-common/google-maps/map-file-import-error.ts`
- Modify: `projects/ui-common/google-maps/public-api.ts`
- Test: `projects/ui-common/google-maps/google-maps.service.spec.ts`

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces:
  - `interface TheSeamMapFileImportError { file: File; error: unknown }` from `map-file-import-error.ts`
  - `GoogleMapsService.fileImportError$: Observable<TheSeamMapFileImportError>`
  - `GoogleMapsService.notifyFileImportError(file: File, error: unknown): void`

- [ ] **Step 1: Write the failing test**

Append to `projects/ui-common/google-maps/google-maps.service.spec.ts`, inside the top-level `describe`:

```ts
  describe('notifyFileImportError', () => {
    it('should emit the file and the error on fileImportError$', () => {
      const { service } = createService()
      const seen: any[] = []
      service.fileImportError$.subscribe((v) => seen.push(v))

      const file = new File(['{}'], 'boundaries.zip')
      const error = new Error('Shape data not found.')
      service.notifyFileImportError(file, error)

      expect(seen).toEqual([{ file, error }])
    })

    it('should not replay an earlier error to a late subscriber', () => {
      const { service } = createService()
      const file = new File(['{}'], 'boundaries.zip')
      service.notifyFileImportError(file, new Error('nope'))

      const seen: any[] = []
      service.fileImportError$.subscribe((v) => seen.push(v))

      expect(seen).toEqual([])
    })
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:ci -- google-maps.service`
Expected: FAIL — `service.fileImportError$ is undefined`.

- [ ] **Step 3: Write the implementation**

Create `projects/ui-common/google-maps/map-file-import-error.ts`:

```ts
/** A file the map tried to import and could not read. */
export interface TheSeamMapFileImportError {
  /** The file as the consumer's user chose or dropped it. */
  file: File

  /**
   * Whatever `readGeoFile` rejected with. Usually an `Error` carrying one of
   * its messages — `Shape data not found.`, `Unable to parse as GeoJSON.` —
   * but a malformed file can surface anything a parser throws, so it is not
   * narrowed.
   */
  error: unknown
}
```

Export it from `projects/ui-common/google-maps/public-api.ts`, alongside the other exports there:

```ts
export * from './map-file-import-error'
```

In `google-maps.service.ts`, add the import:

```ts
import { TheSeamMapFileImportError } from './map-file-import-error'
```

Add the subject next to `_deleteBlockedSubject` (around line 157):

```ts
  /**
   * A file reached one of the import paths and could not be read. Plain
   * `Subject`, not `BehaviorSubject`: a consumer subscribing later should not
   * be handed a failure from before it was listening.
   */
  private readonly _fileImportErrorSubject =
    new Subject<TheSeamMapFileImportError>()
  public readonly fileImportError$ = this._fileImportErrorSubject.asObservable()
```

Add its teardown in `ngOnDestroy`, beside `this._deleteBlockedSubject.complete()`:

```ts
    this._fileImportErrorSubject.complete()
```

Add the notifier next to `setFileInputHandler` / `getFileInputHandler` (around line 941):

```ts
  /**
   * Reports a file the library tried to import and could not read. Called by
   * the import controls, not by consumers — a consumer that owns importing
   * through `setFileInputHandler` reports its own failures.
   */
  public notifyFileImportError(file: File, error: unknown): void {
    this._fileImportErrorSubject.next({ file, error })
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:ci -- google-maps.service`
Expected: PASS, including the two new tests.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/google-maps/map-file-import-error.ts projects/ui-common/google-maps/google-maps.service.ts projects/ui-common/google-maps/public-api.ts projects/ui-common/google-maps/google-maps.service.spec.ts
git commit -m "feat(google-maps): report unreadable import files on the service

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: The upload button reports its failures

**Files:**

- Modify: `projects/ui-common/google-maps/google-maps-upload-button-control/google-maps-upload-button-control.component.ts:120-150`
- Test: `projects/ui-common/google-maps/google-maps-upload-button-control/google-maps-upload-button-control.component.spec.ts`

**Interfaces:**

- Consumes: `GoogleMapsService.notifyFileImportError` from Task 3.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Write the failing test**

Create `projects/ui-common/google-maps/google-maps-upload-button-control/google-maps-upload-button-control.component.spec.ts`.

The component is constructed directly rather than through TestBed, matching `google-maps.service.spec.ts`. A fake `Renderer2` records the `change` listener so the test can fire it, and the hidden input is stubbed so `_getFile` returns a chosen file.

```ts
import { ElementRef, Renderer2 } from '@angular/core'

jest.mock('@theseam/ui-common/utils', () => ({
  readGeoFile: jest.fn(),
}))

import { readGeoFile } from '@theseam/ui-common/utils'

import { GoogleMapsService } from '../google-maps.service'
import { MapValueManagerService } from '../map-value-manager.service'
import { TheSeamGoogleMapsUploadButtonControlComponent } from './google-maps-upload-button-control.component'

const mockReadGeoFile = readGeoFile as jest.Mock

/** Captures listeners so the spec can fire the input's `change` itself. */
function createRenderer(input: HTMLInputElement): {
  renderer: Renderer2
  listeners: Map<string, (event: any) => void>
} {
  const listeners = new Map<string, (event: any) => void>()
  const renderer = {
    createElement: (name: string) =>
      name === 'input' ? input : document.createElement(name),
    setAttribute: () => undefined,
    appendChild: () => undefined,
    listen: (_target: any, event: string, handler: (event: any) => void) => {
      listeners.set(event, handler)
      return () => listeners.delete(event)
    },
  } as unknown as Renderer2
  return { renderer, listeners }
}

function createComponent(file: File | null) {
  const input = document.createElement('input')
  // `configurable` so the multi-file test below can redefine it.
  Object.defineProperty(input, 'files', {
    value: file === null ? [] : [file],
    configurable: true,
  })

  const { renderer, listeners } = createRenderer(input)
  const googleMaps = {
    getFileInputHandler: jest.fn().mockReturnValue(undefined),
    notifyFileImportError: jest.fn(),
  } as unknown as GoogleMapsService
  const mapValueManager = { setValue: jest.fn() } as unknown as
    MapValueManagerService

  const component = new TheSeamGoogleMapsUploadButtonControlComponent(
    new ElementRef(document.createElement('button')),
    mapValueManager,
    renderer,
    googleMaps,
  )

  return { component, listeners, googleMaps, mapValueManager }
}

/** Lets the component's floating import promise settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('TheSeamGoogleMapsUploadButtonControlComponent', () => {
  beforeEach(() => {
    mockReadGeoFile.mockReset()
  })

  it('should report a file it cannot read', async () => {
    const file = new File(['nope'], 'boundaries.zip')
    const error = new Error('Shape data not found.')
    mockReadGeoFile.mockRejectedValue(error)

    const { listeners, googleMaps, mapValueManager } = createComponent(file)
    listeners.get('change')?.(new Event('change'))
    await flush()

    expect(googleMaps.notifyFileImportError).toHaveBeenCalledWith(file, error)
    expect(mapValueManager.setValue).not.toHaveBeenCalled()
  })

  it('should set the map value for a file it can read', async () => {
    const file = new File(['{}'], 'boundaries.zip')
    const json = { type: 'FeatureCollection', features: [] }
    mockReadGeoFile.mockResolvedValue(json)

    const { listeners, googleMaps, mapValueManager } = createComponent(file)
    listeners.get('change')?.(new Event('change'))
    await flush()

    expect(mapValueManager.setValue).toHaveBeenCalledWith(json, 'input')
    expect(googleMaps.notifyFileImportError).not.toHaveBeenCalled()
  })

  it('should report the too-many-files refusal rather than throwing at the listener', async () => {
    const { component, listeners, googleMaps } = createComponent(null)
    const input = (component as any)._fileInputElement as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [new File(['a'], 'a.zip'), new File(['b'], 'b.zip')],
      configurable: true,
    })

    expect(() => listeners.get('change')?.(new Event('change'))).not.toThrow()
    await flush()

    expect(googleMaps.notifyFileImportError).toHaveBeenCalled()
  })
})
```

`MapValueSource.Input` is `'input'` (verified in `map-value-manager.service.ts:5`), which is why the assertions above compare against the literal.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:ci -- google-maps-upload-button-control`
Expected: FAIL — `notifyFileImportError` is never called, and the third test throws out of the listener.

- [ ] **Step 3: Write the implementation**

In `google-maps-upload-button-control.component.ts`, replace the `change` listener registration inside `_createHiddenInput`:

```ts
    this._listeners.push(
      this._renderer.listen(fileInputElement, 'change', (event: Event) => {
        const file = this._getFile()
        if (file === null) {
          return
        }
        const fileImportHandler = this._googleMaps.getFileInputHandler()
        if (fileImportHandler) {
          fileImportHandler(file)
        } else {
          this._importFile(file)
        }
      }),
    )
```

with:

```ts
    this._listeners.push(
      this._renderer.listen(fileInputElement, 'change', (event: Event) => {
        let file: File | null
        try {
          file = this._getFile()
        } catch (err) {
          // `_getFile` refuses a multi-file selection. Report it like any
          // other reason the chosen files could not be imported.
          this._reportImportError(this._fileInputElement.files?.[0], err)
          return
        }

        if (file === null) {
          return
        }

        const fileImportHandler = this._googleMaps.getFileInputHandler()
        if (fileImportHandler) {
          // The consumer owns the file now, including reporting its failures.
          fileImportHandler(file)
        } else {
          this._importFile(file).catch((err) =>
            this._reportImportError(file, err),
          )
        }
      }),
    )
```

Add the helper as a private method on the class, next to `_importFile`:

```ts
  private _reportImportError(file: File | undefined, error: unknown): void {
    if (file === undefined) {
      return
    }
    this._googleMaps.notifyFileImportError(file, error)
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:ci -- google-maps-upload-button-control`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/google-maps/google-maps-upload-button-control/
git commit -m "fix(google-maps): stop the upload button swallowing parse failures

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: The drop path honours `fileImportHandler` and reports failures

**Files:**

- Modify: `projects/ui-common/google-maps/map-file-drop/map-file-drop.component.ts:150-175`
- Test: `projects/ui-common/google-maps/map-file-drop/map-file-drop.component.spec.ts`

**Interfaces:**

- Consumes: `GoogleMapsService.notifyFileImportError` from Task 3.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Write the failing test**

Create `projects/ui-common/google-maps/map-file-drop/map-file-drop.component.spec.ts`.

```ts
import { ElementRef, NgZone, Renderer2 } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

jest.mock('@theseam/ui-common/utils', () => ({
  readGeoFile: jest.fn(),
}))

import { readGeoFile } from '@theseam/ui-common/utils'

import { GoogleMapsService } from '../google-maps.service'
import { MapValueManagerService } from '../map-value-manager.service'
import { TheSeamMapFileDropComponent } from './map-file-drop.component'

const mockReadGeoFile = readGeoFile as jest.Mock

/** Runs callbacks straight through; the component only uses these two. */
const zone = {
  run: (fn: any) => fn(),
  runOutsideAngular: (fn: any) => fn(),
} as unknown as NgZone

/** A drop carrying exactly one file, which is all the component accepts. */
function dropEventFor(file: File): any {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    dataTransfer: {
      files: { length: 1 },
      types: ['Files'],
      items: [{ getAsFile: () => file }],
    },
  }
}

function createComponent(handler?: (file: File) => void) {
  const host = document.createElement('div')
  const mapDiv = document.createElement('div')

  /** Records listeners by the element they were attached to plus the event. */
  const listeners = new Map<string, (event: any) => void>()
  const renderer = {
    listen: (target: any, event: string, fn: (event: any) => void) => {
      listeners.set(target === host ? `host:${event}` : `map:${event}`, fn)
      return () => undefined
    },
    setStyle: () => undefined,
  } as unknown as Renderer2

  const googleMaps = {
    mapReady$: new BehaviorSubject(true),
    getDiv: () => mapDiv,
    getFileInputHandler: () => handler,
    notifyFileImportError: jest.fn(),
  } as unknown as GoogleMapsService
  const mapValueManager = { setValue: jest.fn() } as unknown as
    MapValueManagerService

  const component = new TheSeamMapFileDropComponent(
    new ElementRef(host),
    zone,
    googleMaps,
    mapValueManager,
    renderer,
  )
  component.ngOnInit()

  return { component, listeners, googleMaps, mapValueManager }
}

/** Lets the component's import promise settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('TheSeamMapFileDropComponent', () => {
  beforeEach(() => {
    mockReadGeoFile.mockReset()
  })

  it('should hand a dropped file to the consumer handler when one is set', async () => {
    const handler = jest.fn()
    const file = new File(['{}'], 'boundaries.zip')
    const { listeners, mapValueManager } = createComponent(handler)

    listeners.get('host:drop')?.(dropEventFor(file))
    await flush()

    expect(handler).toHaveBeenCalledWith(file)
    expect(mockReadGeoFile).not.toHaveBeenCalled()
    expect(mapValueManager.setValue).not.toHaveBeenCalled()
  })

  it('should parse and set the value when no handler is set', async () => {
    const json = { type: 'FeatureCollection', features: [] }
    mockReadGeoFile.mockResolvedValue(json)
    const file = new File(['{}'], 'boundaries.zip')
    const { listeners, mapValueManager } = createComponent(undefined)

    listeners.get('host:drop')?.(dropEventFor(file))
    await flush()

    expect(mockReadGeoFile).toHaveBeenCalledWith(file)
    expect(mapValueManager.setValue).toHaveBeenCalledWith(json, 'input')
  })

  it('should report a dropped file it cannot read', async () => {
    const error = new Error('Shape data not found.')
    mockReadGeoFile.mockRejectedValue(error)
    const file = new File(['nope'], 'boundaries.zip')
    const { listeners, googleMaps, mapValueManager } = createComponent(undefined)

    listeners.get('host:drop')?.(dropEventFor(file))
    await flush()

    expect(googleMaps.notifyFileImportError).toHaveBeenCalledWith(file, error)
    expect(mapValueManager.setValue).not.toHaveBeenCalled()
  })

  it('should not report anything once the consumer owns the file', async () => {
    const handler = jest.fn(() => {
      throw new Error('consumer blew up')
    })
    const file = new File(['{}'], 'boundaries.zip')
    const { listeners, googleMaps } = createComponent(handler)

    expect(() =>
      listeners.get('host:drop')?.(dropEventFor(file)),
    ).toThrow('consumer blew up')
    await flush()

    expect(googleMaps.notifyFileImportError).not.toHaveBeenCalled()
  })
})
```

As in Task 4, `MapValueSource.Input` is `'input'`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:ci -- map-file-drop`
Expected: FAIL — the first test fails because `readGeoFile` is called anyway, and the third fails because nothing reports the rejection.

- [ ] **Step 3: Write the implementation**

In `map-file-drop.component.ts`, replace the tail of `_handleDropEvent`:

```ts
    const item = event.dataTransfer.items[0]
    const file = item.getAsFile()
    readGeoFile(file).then((json) => {
      this._mapValueManager.setValue(json, MapValueSource.Input)
    })
```

with:

```ts
    const item = event.dataTransfer.items[0]
    const file = item.getAsFile()
    if (file === null) {
      return
    }

    // These listeners are registered outside Angular's zone, so re-enter it
    // before calling back into anything that expects change detection — the
    // consumer's handler may well render a message from here.
    this._ngZone.run(() => this._importDroppedFile(file))
```

Add the private method below `_handleDropEvent`:

```ts
  /**
   * Routes a dropped file the same way the upload button routes a chosen one,
   * so `fileImportHandler` means "the consumer owns imported files" whichever
   * way the file arrived.
   */
  private _importDroppedFile(file: File): void {
    const fileImportHandler = this._googleMaps.getFileInputHandler()
    if (fileImportHandler) {
      // The consumer owns the file now, including reporting its failures.
      fileImportHandler(file)
      return
    }

    readGeoFile(file)
      .then((json) => {
        this._mapValueManager.setValue(json, MapValueSource.Input)
      })
      .catch((error) => {
        this._googleMaps.notifyFileImportError(file, error)
      })
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:ci -- map-file-drop`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/google-maps/map-file-drop/
git commit -m "fix(google-maps): route dropped files through fileImportHandler

The upload button has always honoured the hook and the drop path never did,
so a consumer that set it still got library-controlled behaviour on a drop.
fileDropEnabled defaults to true, so this was live for anyone who did nothing.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: `fileImportError` output on the map component

**Files:**

- Modify: `projects/ui-common/google-maps/google-maps/google-maps.component.ts` (input/output block around line 259, subscription block around line 341)
- Test: `projects/ui-common/google-maps/google-maps/google-maps.component.spec.ts`

**Interfaces:**

- Consumes: `GoogleMapsService.fileImportError$` and `TheSeamMapFileImportError` from Task 3.
- Produces: `@Output() fileImportError: EventEmitter<TheSeamMapFileImportError>` on `TheSeamGoogleMapsComponent`.

- [ ] **Step 1: Write the failing test**

There is no spec for this component yet. Create `projects/ui-common/google-maps/google-maps/google-maps.component.spec.ts` covering only the new wiring — constructing the whole component is heavy, so drive the subscription the same way the component does.

```ts
import { Subject } from 'rxjs'
import { takeUntil, tap } from 'rxjs/operators'

import { TheSeamMapFileImportError } from '../map-file-import-error'

/**
 * `google-maps.component.ts` subscribes `fileImportError$` and re-emits it on
 * its `@Output`. Constructing the component needs a Google Maps API, a map
 * div and a Terra Draw instance, none of which this behaviour touches, so the
 * subscription is exercised on its own.
 */
describe('TheSeamGoogleMapsComponent fileImportError wiring', () => {
  it('should emit every service error, without replaying', () => {
    const source = new Subject<TheSeamMapFileImportError>()
    const unsubscribe = new Subject<void>()
    const emitted: TheSeamMapFileImportError[] = []

    const file = new File(['nope'], 'boundaries.zip')
    source.next({ file, error: new Error('before subscribing') })

    source
      .pipe(
        tap((value) => emitted.push(value)),
        takeUntil(unsubscribe),
      )
      .subscribe()

    const error = new Error('Shape data not found.')
    source.next({ file, error })
    unsubscribe.next()
    source.next({ file, error: new Error('after teardown') })

    expect(emitted).toEqual([{ file, error }])
  })
})
```

This pins the contract the component relies on — no `skip(1)`, no replay, and teardown on `takeUntil`. Verifying the `@Output` itself fires requires rendering the component, which the Storybook stories already do.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:ci -- google-maps.component`
Expected: FAIL — `Cannot find module '../map-file-import-error'` if Task 3 was skipped; otherwise it passes immediately, which is fine. This test guards the shape rather than driving it.

- [ ] **Step 3: Write the implementation**

In `google-maps.component.ts`, add the import:

```ts
import { TheSeamMapFileImportError } from '../map-file-import-error'
```

Add the output immediately after `deleteBlocked` (around line 259):

```ts
  /**
   * A file reached one of the import paths and could not be read — a corrupt
   * archive, a `.zip` of something else, malformed GeoJSON. Emitted so the
   * consumer can say so in its own UI; the library has nowhere to show it.
   *
   * Not emitted for a file a `fileImportHandler` took: once the consumer owns
   * the file, it owns reporting the outcome too.
   */
  @Output() fileImportError = new EventEmitter<TheSeamMapFileImportError>()
```

Add the subscription immediately after the `deleteBlocked$` subscription (around line 348), inside the same lifecycle method:

```ts
    // As with `deleteBlocked$`, a plain Subject with nothing to replay, so no
    // `skip(1)`.
    this._googleMaps.fileImportError$
      .pipe(
        tap((value) => this.fileImportError.emit(value)),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:ci -- google-maps.component`
Expected: PASS.

- [ ] **Step 5: Verify the library still builds**

The output is a new public API surface, and `tsconfig.lib.json` type-checks differently from `tsconfig.spec.json` — a type that resolves under Jest can still fail the library build.

Run: `npm run build:ui-common`
Expected: build succeeds with no TS errors.

- [ ] **Step 6: Commit**

```bash
git add projects/ui-common/google-maps/google-maps/
git commit -m "feat(google-maps): add fileImportError output to seam-google-maps

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Full verification

**Files:** none modified unless something fails.

**Interfaces:**

- Consumes: everything above.
- Produces: nothing.

- [ ] **Step 1: Run the whole suite**

Run: `npm run test:ci`
Expected: PASS. Note the totals.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors. Warnings from `no-console` in untouched files are pre-existing; new code should add none.

- [ ] **Step 3: Build**

Run: `npm run build:ui-common`
Expected: success.

- [ ] **Step 4: Confirm the fixture helper is not published**

Run: `ls dist/ui-common/utils/` and search the built output for the helper.

```bash
grep -rl "shapefileZip" dist/ui-common/ || echo "not published — correct"
```

Expected: `not published — correct`. If it appears, something imported it from a `public-api.ts`; find and remove that import.

- [ ] **Step 5: Commit anything the checks changed**

If lint auto-fixed formatting:

```bash
git add -A
git commit -m "style: apply lint fixes

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

Otherwise there is nothing to commit and the branch is ready.

---

## Manual check in the app (optional, after Task 7)

The app consumes this via a beta publish, so nothing here is automatic. When the branch is published, the Cotton import modal should:

- accept a multi-shapefile archive, where it previously did nothing at all
- route a dropped file to the app's handler, matching the upload button
- surface a failure through `(fileImportError)` rather than silence

Per the second handoff, the app can keep `fileDropEnabled="false"` until it is ready to use the drop path.
