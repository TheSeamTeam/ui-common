# Geo Export (GeoJSON and Shapefile) — Design

Date: 2026-11-04
Branch: off `marklb/map-interaction-improve`, merged back into it before pushing.

## Intent

Apps need to export field boundaries again. An older app had a GeoJSON-only
export that stringified whatever `TheSeamGoogleMapsComponent.getGeoJson()`
returned and saved it with `FileSaver`. The new export also needs ESRI
Shapefile output. Apps also need to choose which boundaries go out and which
attributes each one carries.

This work adds framework-free utilities to the `@theseam/ui-common/utils`
entry point that turn a GeoJSON `FeatureCollection` into a downloadable
GeoJSON file or a zipped Shapefile. The app decides the content. The library
handles the file formats.

## Goals

- `exportGeoJson()` and `exportShapefile()`: FeatureCollection in,
  `{ blob, filename }` out, plus a small helper that saves that result.
- The app supplies the attributes. Whatever is in each feature's
  `properties` becomes the GeoJSON properties and the Shapefile's `.dbf`
  columns.
- Support at minimum every geometry `seam-google-maps` produces: `Polygon`
  and `MultiPolygon`, **including polygons with holes**. Today's app partners
  don't export holes, but the map tools support them, so the export does too.
- Produce Shapefiles that GIS tools read correctly: correct ring direction,
  one layer for the whole export, WGS84 `.prj`.
- Fail loudly with clear `Error` messages on input that can't be exported.
  Never silently drop data.

## Non-goals

- **The map control / UI.** An export control, like
  `google-maps-upload-button-control` is for import, comes in a later session
  and will be built on these utilities. No Angular code in this work.
- Deciding which boundaries or attributes an app exports. That's app logic.
  For the first consumer, it will look like
  `ModalFieldBoundaryComponent.save()` in the Cotton app, which picks fields
  and pairs their map geometry (`geometryForGroup`) with form values.
- Points, lines and other geometry types.
- Projections other than WGS84 (EPSG:4326).

## Anti-goals

- Storing export metadata on the features the map holds. This was
  considered and rejected: it would have to be kept in sync for a rarely
  used feature. The export collection is built at click time and thrown away.
- A Shapefile that opens but is wrong: holes drawn as filled islands,
  features missing because they collided with others, or attributes shortened
  until they collide.
- Making `@theseam/ui-common/utils` depend on `google-maps` or Angular.

## Decisions (made with the user)

### Layout

Folders inside the existing `utils` entry point, exported from
`projects/ui-common/utils/public-api.ts`, as `geo-json/` is today. They are
not new secondary entry points.

- `projects/ui-common/utils/shp/`: Shapefile read and write code.
  - Move the Shapefile-specific parsing out of
    `geo-json/read-geo-file.ts` (`parseShpFile`, `parseShpZip`,
    `parseZipLayers`, `basename`, and `GEO_FILE_SOURCE_NAME_PROPERTY`).
    `readGeoFile()` stays the public entry point and keeps its signature and
    behavior. Apps almost certainly only use `readGeoFile()`, and since
    everything stays exported from `utils`, the move doesn't change any
    import paths for apps.
  - Move `geo-json/testing/shapefile-fixture.ts` (and its spec) to
    `shp/testing/`, and update `read-geo-file-shp-zip.spec.ts` imports.
    It can stay an independent test fixture, or be rebuilt on the new writer;
    that's the builder's call. Either way, the writer's own tests must read
    output back with `shpjs`, not with the writer's own code.
  - New: the Shapefile writer (below).
- `projects/ui-common/utils/geo-export/`: `exportGeoJson`,
  `exportShapefile`, the save helper and the feature-mapping helper.

### Writer: our own, polygon-only, no new dependencies

At first the user agreed to `@mapbox/shp-write` (0.4.3). After reading its
source and that of its `dbf` dependency (0.2.0), we switched to writing our
own. The user agreed, provided we can be reasonably confident it's correct
(see Testing). The defects found, which our writer must not repeat:

- shp-write writes `Polygon` and `MultiPolygon` features as two layers with
  the same file name, so one overwrites the other in the zip.
- It writes rings in the direction given, with no winding correction.
- `dbf` writes one byte per UTF-16 code unit (`charCodeAt` → `setUint8`)
  and writes no `.cpg`, so text past Latin-1 is corrupted. It silently cuts
  every text value to 254 characters. It declares every number column as
  width 18 with 3 decimals but writes raw `toString()` output, which breaks
  on values like `1e-7`.

The existing test fixture (`geo-json/testing/shapefile-fixture.ts`) already
hand-writes `.shp`, `.dbf`, CRC-32 and a STORED zip. The new writer is that
work grown up, as product code in `utils/shp/`.

**The zip holds one layer, at the zip root:**

| File | Content |
| --- | --- |
| `.shp` | Shape type 5 (Polygon). One record per feature. Each feature written as one multi-part polygon record holding all its rings: outer rings and holes of every part. File and record bounding boxes. |
| `.shx` | Index: offset and content length per record. Most GIS tools require it. |
| `.dbf` | dBASE III attribute table (rules below). |
| `.prj` | WGS84 ESRI WKT: `GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]` |
| `.cpg` | `UTF-8` |

**Geometry:**

- Convert each `Polygon` to a one-part `MultiPolygon` first, so every
  feature takes the same path.
- **Rewind every ring** by its signed area (shoelace): outer rings
  clockwise, holes counter-clockwise, as the Shapefile spec requires. This is
  the opposite of the RFC 7946 GeoJSON convention. Never assume the input's
  direction, since Google Maps output, imported files and hand-written
  GeoJSON can go either way. Write the rewind ourselves (a few lines). Don't
  add `@turf/rewind`.
- Close open rings (the first point repeated as the last), using the existing
  `close-polygons` helper or an equivalent check.
- Coordinates are written as X = longitude, Y = latitude, little-endian
  doubles. Header fields are big-endian, as the spec requires.

**Zip:** STORED (no compression), as the fixture does. Boundary exports are
small, and STORED needs only the CRC-32 we already have. Whether to compress
is the builder's call, if a no-dependency way is available
(`CompressionStream('deflate-raw')` is an option, but async and may be
missing in Jest's environment).

Because nothing new is added to `package.json`, the dependency checklist and
the lazy-loading question don't apply.

### Accepted input

A GeoJSON `FeatureCollection` whose features each have a `Polygon` or
`MultiPolygon` geometry. Anything else throws, with the offending feature's
index in the message: an empty collection, a `null` geometry, any other
geometry type, or a `GeometryCollection`. The app catches it and shows a
toast.

Rings may be open or closed. The writer closes them, using the existing
`close-polygons` helper or an equivalent check.

### Attributes (Shapefile)

Taken from each feature's `properties`. The column set is the union of keys
across all features, in order of first appearance. A feature missing a key
gets an empty value. The user expects apps to export few, simple attributes:
probably a field name (string) and the FSA farm and maybe tract numbers
(integers). Users are in the USA, mostly in the southeast, so non-ASCII text
is unlikely but must still come out right.

| JS value | dBASE column | Rule |
| --- | --- | --- |
| `string` | `C`, width = longest value in **UTF-8 bytes** (min 1) | A value over 254 bytes throws. Text is written as UTF-8, matching the `.cpg`. |
| `number` | `N`, width and decimals computed from the column's values | Written as fixed-point text (never exponent notation). Integers get 0 decimals. Non-finite values (`NaN`, `Infinity`) throw. Exceeding the format's width limit throws. The exact limits and how many decimals to keep are the builder's call; keep at least 8 for things like acreage. |
| `boolean` | `L` | `T` / `F`. |
| `Date` | `D` (`YYYYMMDD`) | Uses the **local** calendar date (`getFullYear`/`getMonth`/`getDate`), so a date is never shifted by UTC conversion. |
| `null` / `undefined` | (any) | Written as empty. A column whose values are all null or undefined is a `C` column of width 1. |
| object / array | — | Throws. The app must flatten them. |

- A column whose non-empty values mix these types throws.
- Names longer than 10 bytes throw. Names that are only unique when case is
  ignored also throw, because dBASE treats them as the same. Non-ASCII names
  throw. **Names are never shortened or renamed silently.**
- **No attributes anywhere** (every feature's `properties` is `null` or `{}`):
  write one `N` column named `ID` with values 1…n, the same thing GDAL does.
  A `.dbf` with zero columns breaks some GIS tools. This applies only when the
  app supplied no attributes at all. Any supplied attribute means no `ID`
  column is added.

GeoJSON export applies none of these rules. It writes the properties as
given. Its only check is that the input is a `FeatureCollection`, so it stays
a drop-in replacement for the old app's export. The Polygon-only and
non-empty rules in "Accepted input" apply to the Shapefile export only.

The GeoJSON export does orient Polygon and MultiPolygon rings to the RFC 7946
right-hand rule (outer counter-clockwise, holes clockwise). It works on a copy
and changes nothing else. This was added after implementation, at the user's
request. RFC 7946 §3.1.6 says writers MUST follow the rule, while readers
SHOULD accept either direction. Google Maps keeps whatever direction a ring was
drawn or loaded in, so `getGeoJson()` output can be backwards.

### API shape

Types exported from `public-api.ts` use the `TheSeam` prefix (project
convention). Functions are unprefixed, like `readGeoFile`.

```ts
// utils/shp
toShapefileZip(
  collection: FeatureCollection,
  options?: TheSeamShapefileOptions, // { layerName?: string }  (name of the .shp/.dbf/... inside the zip)
): Promise<Blob>

// utils/geo-export
interface TheSeamGeoExportFile { blob: Blob; filename: string }

exportGeoJson(collection, options?: { filename?: string }): TheSeamGeoExportFile
exportShapefile(collection, options?: { filename?: string; layerName?: string }): Promise<TheSeamGeoExportFile>
saveGeoExportFile(file: TheSeamGeoExportFile): void   // FileSaver.saveAs

mapFeaturesForExport(
  collection: FeatureCollection,
  mapFn: (feature: Feature, index: number) => GeoJsonProperties | null, // null = leave the feature out
): FeatureCollection   // new collection; input not mutated
```

- GeoJSON: `application/geo+json`, `.geojson` extension. The upload control
  already accepts `.geojson`, so files round-trip.
- Shapefile: `application/zip`, `.zip` extension. The zip holds one layer
  (`.shp`, `.shx`, `.dbf`, `.prj`, `.cpg`) at the zip root.
- `filename` is a base name without extension. Run it through the existing
  `sanitizeFilename`. The default names are the builder's call (e.g.
  `boundaries`).
- Nothing mutates the caller's collection.

## Testing

- Jest, under `utils` (already enabled in `jest.config.ts`). Run with
  `--maxWorkers=2`.
- **Round-trip through `shpjs`.** Export a Shapefile, then read it back with
  the real `readGeoFile()`/`parseZip`. Cover: a Polygon, a MultiPolygon,
  a mix of both (guards against the overwrite bug), a polygon with a hole,
  input with clockwise rings, and input with counter-clockwise rings.
  `shpjs` tells holes from outer rings by ring direction, so a hole that
  comes back as a hole proves the rewind.
- Attributes read back through `shpjs`, which honors `.cpg`: a string
  (including a non-ASCII one, such as a curly quote), an integer, a decimal,
  a boolean, a date and an empty value. Also each throw case, union-of-keys,
  and the `ID` column for attribute-less input.
- **Byte-level checks of the binary format**, since `shpjs` is lenient and
  doesn't read `.shx`. Check the `.shp`/`.shx` header (file code 9994,
  version 1000, shape type 5, file length in 16-bit words, bounding box). Check
  that every `.shx` entry points at its `.shp` record's offset and content
  length. Check the `.dbf` header (record count, header length, record
  length, field descriptors, `0x0D` terminator, `0x1A` EOF).
- GeoJSON export: content, MIME type, filename and sanitizing.
- `npm run build:ui-common` must pass.
- **External check (manual, once):** write a sample export with a hole, a
  MultiPolygon and each attribute type. The user, or the builder if GDAL is
  installed (`ogrinfo -al`), opens it in a real GIS tool (QGIS, ogrinfo or
  ArcGIS) to confirm it opens without warnings, holes are holes and
  attributes read correctly. Don't install GDAL to do this. Ask the user
  instead.

## Left to the builder

- Internal file and function names inside `shp/` and `geo-export/`, and
  whether the attribute check and rewind are their own exported helpers.
- Default filenames and layer name.
- Exact error message wording.
- Whether a Storybook story is worth adding (none is required, since there's
  no UI).
