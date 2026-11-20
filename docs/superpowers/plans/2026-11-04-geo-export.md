# Geo Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Framework-free utilities in `@theseam/ui-common/utils` that turn a GeoJSON `FeatureCollection` into a downloadable `.geojson` file or a zipped ESRI Shapefile (`.shp`/`.shx`/`.dbf`/`.prj`/`.cpg`).

**Architecture:** A dependency-free, polygon-only Shapefile writer in `utils/shp/`, grown from the existing test fixture. It has separate units for the zip, ring preparation, `.shp`/`.shx` and `.dbf`, plus one function that composes them. A thin `utils/geo-export/` layer names the files, builds the `Blob`s and saves them. Shapefile *reading* moves from `geo-json/read-geo-file.ts` into `utils/shp/`; `readGeoFile()` keeps its behavior.

**Tech Stack:** TypeScript, `geojson` types, Jest (jsdom), `shpjs` (already a dependency; used only to read output back in specs), `file-saver` (already a dependency).

**Spec:** `docs/superpowers/specs/2026-11-04-geo-export-design.md`. Read it first. It holds the reasons behind every rule below.

## Global Constraints

- No new dependencies. `package.json` and `ng-package.json` stay unchanged.
- Everything stays inside the existing `utils` entry point. New folders are exported from `projects/ui-common/utils/public-api.ts`. No new `ng-package.json`.
- No Angular or `google-maps` imports anywhere in `utils/shp` or `utils/geo-export`.
- Exported types use the `TheSeam` prefix. Functions are unprefixed. No `I`-prefixed interfaces.
- Never mutate the caller's `FeatureCollection`, its features, geometries or coordinate arrays. In particular, do **not** call `closePolygons()` (it mutates). Close rings on copies.
- Never silently shorten, rename or drop data. Throw an `Error` with a clear message instead.
- Run Jest as `npx jest --maxWorkers=2 <path>`. A bare `npx jest` can run out of memory.
- Prettier style: no semicolons, single quotes, trailing commas. The pre-commit hook runs Prettier and ESLint.
- Fixture and test values are invented. No customer data, since this repo is public.
- Commit messages are conventional commits, ending with the literal line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Copy it exactly; don't substitute your own model name.
- Work on branch `marklb/geo-export` (already created off `marklb/map-interaction-improve`).

## Review Focus

1. **App-internal or long property keys** (an app passes raw map features whose properties include keys like `seamFeatureKey`): the Shapefile export throws, and the message names the offending key. Owned by Task 5.
2. **Degenerate rings** (fewer than 3 distinct positions, or zero area, e.g. a doubled-back line): throws naming the feature index. Never writes a ring whose direction can't be determined. Owned by Task 3.
3. **3-D positions** (`[lon, lat, alt]` from imported GeoJSON): written as X/Y, the altitude ignored, no throw. Owned by Task 3.
4. **Number columns mixing negatives, integers and decimals** (e.g. `-3`, `12.5`, `0.0000001`): one `N` column wide enough for all of them, every value read back equal. Owned by Task 5.
5. **A filename that already has the extension** (`exportShapefile(c, { filename: 'fields.zip' })`): produces `fields.zip`, not `fields.zip.zip`. Owned by Task 7.

---

### Task 1: Move Shapefile reading and the fixture into `utils/shp`

Pure move with no behavior change. Existing specs prove it.

**Files:**
- Create: `projects/ui-common/utils/shp/read-shapefile.ts`
- Move: `projects/ui-common/utils/geo-json/testing/shapefile-fixture.ts` → `projects/ui-common/utils/shp/testing/shapefile-fixture.ts`
- Move: `projects/ui-common/utils/geo-json/testing/shapefile-fixture.spec.ts` → `projects/ui-common/utils/shp/testing/shapefile-fixture.spec.ts`
- Modify: `projects/ui-common/utils/geo-json/read-geo-file.ts`
- Modify: `projects/ui-common/utils/geo-json/read-geo-file-shp-zip.spec.ts` (fixture import path)

**Interfaces:**
- Produces (in `shp/read-shapefile.ts`):
  - `export const GEO_FILE_SOURCE_NAME_PROPERTY = 'seamSourceFileName'` (moved with its doc comment)
  - `export function readShpFile(buffer: ArrayBuffer): FeatureCollection` (was `parseShpFile`)
  - `export async function readShpZip(buffer: ArrayBuffer): Promise<FeatureCollection>` (was `parseShpZip`, with `parseZipLayers` and `basename` as private helpers)
- `read-geo-file.ts` keeps `readGeoFile`, `coerceToArrayBuffer`, `parseGeoJson`, and adds `export { GEO_FILE_SOURCE_NAME_PROPERTY } from '../shp/read-shapefile'`. That keeps `public-api.ts` and every existing import working unchanged.

- [ ] **Step 1:** Use `git mv` for the two fixture files, then move the parsing functions into `shp/read-shapefile.ts`, keeping their comments. Update imports (`read-geo-file.ts`, `read-geo-file-shp-zip.spec.ts`, and the fixture spec's relative imports).
- [ ] **Step 2: Run the moved and affected specs**

Run: `npx jest --maxWorkers=2 projects/ui-common/utils/geo-json/read-geo-file projects/ui-common/utils/shp`
Expected: PASS, with the same test count as before the move. Check that count first by running the same command on `geo-json` before Step 1.

- [ ] **Step 3: Commit** `refactor(utils): move shapefile reading into utils/shp`

---

### Task 2: Stored-zip writer

**Files:**
- Create: `projects/ui-common/utils/shp/write-zip.ts`
- Test: `projects/ui-common/utils/shp/write-zip.spec.ts`
- Modify: `projects/ui-common/utils/shp/testing/shapefile-fixture.ts` (drop its private `CRC_TABLE`/`crc32`/`writeZip`, and import from `../write-zip`)

**Interfaces:**
- Produces:
  - `export interface ZipEntry { name: string; data: Uint8Array }`
  - `export function crc32(bytes: Uint8Array): number` (unsigned 32-bit)
  - `export function writeStoredZip(entries: ZipEntry[]): Uint8Array`, which is the fixture's `writeZip`, moved as-is (STORED, local headers, central directory, end record)
  - Not exported from `public-api.ts`.

- [ ] **Step 1: Write failing tests** in `write-zip.spec.ts`:
  - `crc32 matches the standard check value`: `crc32(new TextEncoder().encode('123456789'))` is `0xcbf43926`.
  - `writeStoredZip lays out a stored archive`: for entries `[{ name: 'a.txt', data: Uint8Array.of(1, 2, 3) }, { name: 'b.txt', data: Uint8Array.of(4) }]`, the first 4 bytes are `0x04034b50` (LE). Bytes `[1, 2, 3]` appear at offset `30 + 5`. The last 22 bytes start with `0x06054b50` (LE), with entry count `2` at +8 and +10. Reading through `shpjs` is covered by the fixture specs in Step 4.
- [ ] **Step 2:** Run `npx jest --maxWorkers=2 projects/ui-common/utils/shp/write-zip`. Expected: FAIL (module not found).
- [ ] **Step 3:** Create `write-zip.ts` by moving the fixture's code. Point the fixture at it.
- [ ] **Step 4:** Run `npx jest --maxWorkers=2 projects/ui-common/utils/shp projects/ui-common/utils/geo-json/read-geo-file`. Expected: PASS. The fixture specs prove the moved zip still reads in `shpjs`.
- [ ] **Step 5: Commit** `refactor(utils): extract stored zip writer from the shapefile fixture`

---

### Task 3: Ring preparation (validate, close, rewind)

**Files:**
- Create: `projects/ui-common/utils/shp/shapefile-rings.ts`
- Test: `projects/ui-common/utils/shp/shapefile-rings.spec.ts`

**Interfaces:**
- Produces:
  - `export type ShpRing = [number, number][]` (closed, X = lon, Y = lat)
  - `export function ringSignedArea(ring: ShpRing): number`: shoelace. Positive means counter-clockwise.
  - `export function toShapefileRings(geometry: Polygon | MultiPolygon, featureIndex: number): ShpRing[]` returns every ring of the feature in write order: polygon 1's outer ring, then its holes, then polygon 2's outer ring, then its holes, and so on. It returns new arrays and never mutates the input.

Rules for `toShapefileRings`:
- `Polygon` is treated as a one-polygon `MultiPolygon`.
- Each position keeps only `[0]` and `[1]`. Either one being non-finite throws.
- Close the ring (append a copy of the first position) if the first and last differ.
- A ring with fewer than 4 positions after closing, or with `ringSignedArea === 0`, throws: `` `Feature ${featureIndex} has a ring with no area.` ``
- A polygon with zero rings, or a MultiPolygon with zero polygons, throws: `` `Feature ${featureIndex} has no rings.` ``
- Outer ring (index 0 of each polygon): reverse if area > 0, so it ends up **clockwise**. Holes (index ≥ 1): reverse if area < 0, so they end up **counter-clockwise**.

- [ ] **Step 1: Write failing tests:**
  - `ringSignedArea is positive for a counter-clockwise square`: `[[0,0],[1,0],[1,1],[0,1],[0,0]]` → `1`.
  - `makes outer rings clockwise and holes counter-clockwise`: a Polygon with a CCW outer `[[0,0],[10,0],[10,10],[0,10],[0,0]]` and a CW hole `[[2,2],[2,4],[4,4],[4,2],[2,2]]`. Expect `ringSignedArea(result[0]) < 0` and `ringSignedArea(result[1]) > 0`. Run the same with both inputs already in shapefile direction; the output is the same.
  - `orders MultiPolygon rings polygon by polygon`: two polygons, the first with one hole. Expect 3 rings, with the outer ring of polygon 2 at index 2.
  - `closes open rings`: an open 4-point square → 5 points, last equals first.
  - `drops altitude` (Review Focus 3): `[[0,0,5],[1,0,5],[1,1,5],[0,0,5]]` → every point has length 2.
  - `throws on a ring with no area` (Review Focus 2): `[[0,0],[1,1],[0,0]]` and `[[0,0],[1,1],[2,2],[0,0]]` both throw `/Feature 3 has a ring with no area/` when called with `featureIndex` 3.
  - `throws on non-finite coordinates`.
  - `does not mutate its input`: `structuredClone` the input before; `toEqual` after.
- [ ] **Step 2:** Run `npx jest --maxWorkers=2 projects/ui-common/utils/shp/shapefile-rings`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(utils): prepare polygon rings for shapefile output`

---

### Task 4: `.shp` and `.shx` writer

**Files:**
- Create: `projects/ui-common/utils/shp/write-shp.ts`
- Test: `projects/ui-common/utils/shp/write-shp.spec.ts`

**Interfaces:**
- Consumes: `ShpRing` (Task 3).
- Produces: `export function writeShpAndShx(features: ShpRing[][]): { shp: Uint8Array; shx: Uint8Array }`. There is one `ShpRing[]` per record, from `toShapefileRings`, and records are numbered 1…n in order.

Byte layout (generalize the fixture's single-ring `writeShp`):
- Header (100 bytes, identical in both files except the file length): file code `9994` at 0 (BE), file length in 16-bit words at 24 (BE), version `1000` at 28 (LE), shape type `5` at 32 (LE), file bbox Xmin, Ymin, Xmax, Ymax as LE doubles at 36/44/52/60. Bytes 68–99 (Z/M ranges) are zero.
- `.shp` record: record number (BE) and content length in words (BE). Then content: shape type 5 (LE), record bbox (4 LE doubles), numParts (LE), numPoints (LE), one LE int32 start index per part, and the points as LE double pairs. Content length in bytes = `44 + 4 * numParts + 16 * numPoints`.
- `.shx`: header with file length `50 + 4 * n` words, then one 8-byte entry per record: the `.shp` offset of that record's header, in words (BE), and its content length in words (BE).

- [ ] **Step 1: Write failing tests:**
  - `writes headers both files agree on`: for two features, read with `DataView`: file code, version, shape type, both files' bbox equal across all points, and `shp` file length × 2 === `shp.byteLength` (same for `shx`, `=== 100 + 8 * 2`).
  - `indexes every record in the .shx`: for each entry `i`, `offsetWords * 2` points at a `.shp` position whose BE int32 is record number `i + 1`, and the content lengths match.
  - `round-trips through shpjs parseShp`: `parseShp(toArrayBuffer(shp))` (from `shpjs`) for `[polygonWithHole, twoPartMultiPolygon]`, both prepared with `toShapefileRings`. Expect geometry 0 `type === 'Polygon'` with 2 rings, and geometry 1 `type === 'MultiPolygon'` with 2 polygons. Coordinates `toBeCloseTo` the input (allowing for ring direction: compare as sets of points, or compare against the rings `toShapefileRings` produced). `shpjs` groups holes by ring direction, so a correct hole proves the rewind.
- [ ] **Step 2:** Run `npx jest --maxWorkers=2 projects/ui-common/utils/shp/write-shp`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Commit** `feat(utils): write shapefile .shp and .shx`

---

### Task 5: `.dbf` writer and attribute rules

**Files:**
- Create: `projects/ui-common/utils/shp/write-dbf.ts`
- Test: `projects/ui-common/utils/shp/write-dbf.spec.ts`

**Interfaces:**
- Produces: `export function writeDbf(rows: GeoJsonProperties[]): Uint8Array`. There is one row per feature, `null` is treated as `{}`, and the rows are in the same order as the `.shp` records.

Rules (from the spec's attribute table):
- Columns are the union of keys, in order of first appearance. A key whose value is `undefined` everywhere is still a column (all empty).
- **Names:** must be non-empty, printable ASCII (`/^[\x21-\x7e][\x20-\x7e]*$/`) and ≤ 10 characters. Names that are equal ignoring case throw. Every name error message includes the name in quotes, e.g. `` `Attribute name "seamFeatureKey" is longer than 10 characters.` `` (Review Focus 1).
- **Column type** comes from the non-empty values (`null`/`undefined` are empty): `string`→`C`, finite `number`→`N`, `boolean`→`L`, `Date`→`D`. Any other value type (object, array, bigint, function, `NaN`, `±Infinity`, an invalid `Date`) throws, naming the column. Two types mixed in one column throws, naming the column. A column with only empty values is `C`, width 1.
- **`C`:** values UTF-8-encoded (`TextEncoder`). Width = max(1, longest byte length). A value over 254 bytes throws. Right-padded with `0x20`.
- **`N`:** the decimals and width are computed as below, never in exponent notation. Right-aligned (`padStart`). Empty → all spaces.

  ```ts
  const MAX_N_WIDTH = 19 // ESRI's limit for a double column
  // Per value v. toFixed(15) avoids exponent notation and rounds off float
  // noise like 0.1 + 0.2. Trailing zeros are not significant.
  const [int, frac = ''] = Math.abs(v).toFixed(15).replace(/\.?0+$/, '').split('.')
  const lead = (v < 0 ? 1 : 0) + int.length // sign + integer digits
  // Per column, over its non-empty values:
  const maxLead = Math.max(...leads)
  let decimals = Math.min(15, Math.max(...fracs.map((f) => f.length)))
  const widthFor = (d: number) => maxLead + (d > 0 ? d + 1 : 0)
  if (widthFor(decimals) > MAX_N_WIDTH) {
    decimals = Math.max(8, MAX_N_WIDTH - maxLead - 1) // shed decimals, keep ≥ 8
  }
  if (widthFor(decimals) > MAX_N_WIDTH) throw new Error(/* names the column */)
  // Each value is written as v.toFixed(decimals).padStart(widthFor(decimals)).
  ```

  19 is ESRI's limit for a double column. A column of integers gets 0 decimals.
- **`L`:** `T`/`F`, width 1. Empty → `?`.
- **`D`:** width 8, `YYYYMMDD` from `getFullYear()`/`getMonth() + 1`/`getDate()` (local time). Empty → 8 spaces.
- **No columns at all** (every row `null`/`{}`): write one `N` column `ID` with values `1…n`, width = digit count of `n`.
- **File:** byte 0 is `0x03`. Bytes 1–3 hold today's local date (year − 1900, month, day). Then the record count (uint32 LE at 4), header length `32 * (cols + 1) + 1` (uint16 LE at 8; don't pad it, see the fixture's comment about `parsedbf`), and record length `1 + Σ widths` (uint16 LE at 10). Each 32-byte descriptor holds the name (null-padded, 11 bytes), the type character at +11, the width at +16 and the decimal count at +17. The `0x0D` terminator follows. Each record starts with the flag `0x20`. The file ends with `0x1A`.

- [ ] **Step 1: Write failing tests.** Read values back through `shpjs`: build a zip with `writeStoredZip` holding `test.shp`/`test.shx` from `writeShpAndShx` (one unit square per row), `test.dbf` from `writeDbf`, and `test.cpg` = `UTF-8`. Then `parseZip`. Define this `readBack(rows)` helper in the spec.
  - `round-trips each attribute type`: `{ NAME: 'North Quarter', FARM: 1234, ACRES: 12.5, ACTIVE: true, PLANTED: new Date(2026, 3, 15) }`. Expect equal values back (`PLANTED` is the local date 2026-04-15).
  - `writes UTF-8 text`: `NAME: 'Smith’s “East” Field'` reads back equal.
  - `fills missing keys with empty values`: rows `{ A: 'x' }` and `{ B: 2 }`. Both columns exist; row 0's `B` reads back `NaN` or empty, and row 1's `A` reads back `''`.
  - `sizes one N column for mixed numbers` (Review Focus 4): values `-3`, `12.5`, `0.0000001`. They read back `toBeCloseTo` each value, and the descriptor has decimals ≥ 7.
  - `writes integers with no decimals`: the descriptor decimal byte is `0` for `[1, 22, 333]`.
  - `adds an ID column only when no attributes exist`: rows `[null, {}]` → one column `ID`, values `1`, `2`. Rows `[{ NAME: 'a' }, {}]` → no `ID` column.
  - Byte checks: header length, record length, record count, terminator `0x0D` at `32 * (cols + 1)`, last byte `0x1A`.
  - Throws (one `it` each, matching on the column name): name longer than 10 (`seamFeatureKey`), non-ASCII name, names differing only in case (`Name`/`NAME`), empty name, object value, array value, `NaN`, mixed string and number, text over 254 UTF-8 bytes (`'é'.repeat(128)` is 256 bytes), invalid `Date`, and a number too wide (`1e25`).
- [ ] **Step 2:** Run `npx jest --maxWorkers=2 projects/ui-common/utils/shp/write-dbf`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Commit** `feat(utils): write shapefile .dbf attributes`

---

### Task 6: `writeShapefileZip` / `toShapefileZip`

**Files:**
- Create: `projects/ui-common/utils/shp/to-shapefile-zip.ts`
- Test: `projects/ui-common/utils/shp/to-shapefile-zip.spec.ts`
- Modify: `projects/ui-common/utils/public-api.ts` (add `export * from './shp/to-shapefile-zip'`)

**Interfaces:**
- Consumes: `toShapefileRings` (Task 3), `writeShpAndShx` (Task 4), `writeDbf` (Task 5), `writeStoredZip` (Task 2), `sanitizeFilename` (`../sanitize-filename`).
- Produces:
  - `export interface TheSeamShapefileOptions { /** Base name of the files inside the zip. Default 'boundaries'. */ layerName?: string }`
  - `export function writeShapefileZip(collection: FeatureCollection, options?: TheSeamShapefileOptions): Uint8Array`: synchronous, used by tests and by `toShapefileZip`.
  - `export async function toShapefileZip(collection: FeatureCollection, options?: TheSeamShapefileOptions): Promise<Blob>`: the same bytes in a `Blob` of type `application/zip`. It's async so compression can be added later without an API change.
  - `export const SHAPEFILE_WGS84_PRJ`: the WKT string, exactly as in the spec.

Behavior:
- Not a FeatureCollection (missing `type: 'FeatureCollection'` or a `features` array) → throw `'Expected a GeoJSON FeatureCollection.'`
- Zero features → throw `'There are no features to export.'`
- A feature with `null` geometry, or a geometry other than `Polygon`/`MultiPolygon` → throw `` `Feature ${i} has a ${type} geometry; only Polygon and MultiPolygon can be exported as a shapefile.` `` (use `'null'` for null).
- `layerName` → `sanitizeFilename(layerName)`. Fall back to `'boundaries'` when the result is empty.
- Zip entries at the root, in this order: `${layer}.shp`, `${layer}.shx`, `${layer}.dbf`, `${layer}.prj` (`SHAPEFILE_WGS84_PRJ`), `${layer}.cpg` (`UTF-8`). Text is encoded with `TextEncoder`.

- [ ] **Step 1: Write failing tests** (read back with `parseZip(toArrayBuffer(writeShapefileZip(...)))`):
  - `keeps Polygon and MultiPolygon features together`: one of each, with properties `{ NAME: 'A' }` / `{ NAME: 'B' }`. Read-back has 2 features in order, types `Polygon`/`MultiPolygon`, and names `A`/`B`. This guards against the overwrite bug the spec describes in shp-write.
  - `keeps holes whichever direction the input uses`: the same polygon with a hole, given once in RFC 7946 direction and once reversed. Both read back as a Polygon with 2 rings, and the hole's points `toBeCloseTo` the input hole's points.
  - `writes all five members`: list the zip's entry names by scanning local headers, or use `parseZip`'s result plus a byte scan for each name. Expect `boundaries.shp/.shx/.dbf/.prj/.cpg`. With `{ layerName: 'my/fields' }`, the names use the sanitized `my_fields`.
  - `does not mutate the input`: `structuredClone` the collection before; `toEqual` after.
  - `toShapefileZip returns an application/zip Blob` whose bytes (via `readFileAsync` from `../file-utils`) equal `writeShapefileZip`'s.
  - Throws: not a collection, empty, null geometry (`/Feature 1 has a null geometry/`), `Point`, `GeometryCollection`.
  - Note: `shpjs` reprojects through `proj4` when a `.prj` is present, so compare coordinates with `toBeCloseTo(x, 9)`, not `toEqual`.
- [ ] **Step 2:** Run `npx jest --maxWorkers=2 projects/ui-common/utils/shp/to-shapefile-zip`. Expected: FAIL.
- [ ] **Step 3:** Implement. Add the `public-api.ts` export.
- [ ] **Step 4:** Run `npx jest --maxWorkers=2 projects/ui-common/utils/shp`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(utils): build zipped shapefiles from GeoJSON`

---

### Task 7: `utils/geo-export`

**Files:**
- Create: `projects/ui-common/utils/geo-export/geo-export.ts`
- Create: `projects/ui-common/utils/geo-export/map-features-for-export.ts`
- Test: `projects/ui-common/utils/geo-export/geo-export.spec.ts`, `projects/ui-common/utils/geo-export/map-features-for-export.spec.ts`
- Modify: `projects/ui-common/utils/public-api.ts` (export both files)

**Interfaces:**
- Consumes: `toShapefileZip`, `TheSeamShapefileOptions` (Task 6), `sanitizeFilename`, `FileSaver` (`import FileSaver from 'file-saver'`, as in `data-exporter/exporters/csv-exporter.ts`).
- Produces:
  - `export interface TheSeamGeoExportFile { blob: Blob; filename: string }`
  - `export interface TheSeamGeoJsonExportOptions { filename?: string }`
  - `export interface TheSeamShapefileExportOptions { filename?: string; layerName?: string }`
  - `export function exportGeoJson(collection: FeatureCollection, options?: TheSeamGeoJsonExportOptions): TheSeamGeoExportFile`
  - `export async function exportShapefile(collection: FeatureCollection, options?: TheSeamShapefileExportOptions): Promise<TheSeamGeoExportFile>`
  - `export function saveGeoExportFile(file: TheSeamGeoExportFile): void`, which calls `FileSaver.saveAs(file.blob, file.filename)`
  - `export function mapFeaturesForExport(collection: FeatureCollection, mapFn: (feature: Feature, index: number) => GeoJsonProperties | null): FeatureCollection`

Behavior:
- Filename: the base defaults to `'boundaries'`. Strip a trailing extension that matches the output (`.geojson` or `.json` for GeoJSON, `.zip` for Shapefile), ignoring case. Then `sanitizeFilename`, falling back to `'boundaries'` if empty. Then append `.geojson` / `.zip`.
- `exportGeoJson`: throws `'Expected a GeoJSON FeatureCollection.'` when the input isn't one. Otherwise it applies no geometry or attribute rules. The blob holds `JSON.stringify(collection)` with type `application/geo+json`.
- `exportShapefile`: `layerName` defaults to the sanitized base filename. Delegates to `toShapefileZip`.
- `mapFeaturesForExport`: returns a new collection. A feature where `mapFn` returns `null` is left out. Otherwise the result is `{ ...feature, properties: result }` (geometry shared by reference, input unchanged). `index` is the position in the input.

- [ ] **Step 1: Write failing tests:**
  - `exportGeoJson writes the collection as application/geo+json`: blob type, and the text read back via `readFileAsync` + `TextDecoder` parses to an object equal to the input.
  - `exportGeoJson accepts any FeatureCollection`: a `Point` feature does not throw. A non-collection does throw.
  - `names files`: default `boundaries.geojson` / `boundaries.zip`. `'North Farm'` → `North Farm.geojson`. `'a/b'` → `a_b.zip`.
  - `does not double the extension` (Review Focus 5): `'fields.zip'` → `fields.zip`, `'fields.GeoJSON'` → `fields.geojson`, `'fields.json'` → `fields.geojson`.
  - `exportShapefile names the layer after the file`: read back the zip bytes and find the `North_Farm.shp` member when called with `filename: 'North/Farm'`. An explicit `layerName` overrides it.
  - `saveGeoExportFile saves the blob under its filename`: `jest.mock('file-saver')`. Expect `saveAs` to have been called with `(blob, 'boundaries.zip')`.
  - `mapFeaturesForExport`: drops features mapped to `null`, replaces properties, passes the input index, and leaves the input unchanged (`structuredClone` before, `toEqual` after).
- [ ] **Step 2:** Run `npx jest --maxWorkers=2 projects/ui-common/utils/geo-export`. Expected: FAIL.
- [ ] **Step 3:** Implement. Add the `public-api.ts` exports. Add a doc comment on `exportGeoJson`/`exportShapefile` showing the app's intended flow: `getGeoJson()` → `mapFeaturesForExport` → `export*` → `saveGeoExportFile`, with toasts left to the app.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Commit** `feat(utils): add GeoJSON and shapefile export helpers`

---

### Task 8: Verification and sample for a manual GIS check

**Files:** none committed.

- [ ] **Step 1:** Run `npx jest --maxWorkers=2 projects/ui-common/utils`. Expected: all PASS.
- [ ] **Step 2:** Run `npm run lint`. Expected: no new errors in `utils/shp` or `utils/geo-export`.
- [ ] **Step 3:** Run `npm run build:ui-common`. Expected: build succeeds. If it does, check that `dist/ui-common` has `exportShapefile` in the `utils` `.d.ts`.
- [ ] **Step 4: Write a sample export.** Create a temporary spec, `projects/ui-common/utils/geo-export/sample.tmp.spec.ts` (don't commit it). It calls `writeShapefileZip` and writes the bytes with `fs.writeFileSync` to the session scratchpad as `geo-export-sample.zip`, along with the matching `.geojson`. The data is a polygon with a hole, a two-part MultiPolygon, and attributes `NAME` (one with a curly apostrophe), `FARM` (integer), `ACRES` (decimal), `ACTIVE`, `PLANTED` (date), all invented. Run it, then delete the spec.
- [ ] **Step 5:** Report the sample's full path to the user. Ask them to open it in QGIS or ArcGIS and confirm: it opens without warnings, the hole is empty, the MultiPolygon is one row, and the attributes read correctly, including the apostrophe. Don't install GDAL or QGIS.
