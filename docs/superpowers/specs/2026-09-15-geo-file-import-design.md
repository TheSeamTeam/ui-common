# Geo file import — design

Epic [NCC-2872](https://theseam.youtrack.cloud/issue/NCC-2872) ·
Issue [NCC-2873](https://theseam.youtrack.cloud/issue/NCC-2873) · Date: 2026-09-15

Answers the three items in the Cotton app's third handoff
(`docs/superpowers/specs/2026-09-14-ui-common-third-handoff.md` in that repo):
multi-shapefile archives are refused, dropped files cannot be intercepted, and
parse errors are swallowed.

The items fall in two areas that do not touch each other. Item 1 is
`utils/geo-json` and knows nothing about maps; items 2 and 3 are `google-maps`
and change no parsing. They ship together because one app slice needs all
three, and because item 3 spans both.

## Verified against shpjs 6.2.0

Four facts from reading `shpjs@6.2.0` and its `but-unzip` / `parsedbf`
dependencies. Each one moves a decision below, so they are recorded rather
than assumed.

1. **`parseZip` never returns an empty array.** It throws
   `no layers founds` when an archive holds no `.shp` or `.json` member. The
   current `featCollection.length === 0` branch is therefore unreachable, and
   an empty archive surfaces shpjs's raw message today.
2. **A single-member archive returns the collection directly**, not a
   one-element array, with `fileName` set on the collection object. That is
   what the existing `withoutProperty(featCollection, 'fileName')` strips.
3. **`fileName` is the member path minus its extension**, not a bare stem.
   The Deere exports keep their members under `boundaries/`, so their names
   arrive as `boundaries/<field>`.
4. **`parseShp` reads only the `.shp`**, with an optional sibling `.prj` and
   `.dbf`. It never opens the `.shx`, and shpjs's unzip step filters the
   archive down to `shp|dbf|json|prj|cpg` before parsing, so a `.shx` member
   would be discarded unread.

## 1. `parseShpZip` concatenates members

`parseShpZip` normalizes `parseZip`'s return to an array, coerces each member
through the existing `coerceFeatureCollection`, concatenates the `features`,
and returns one freshly built `FeatureCollection`.

**Concatenation only.** Features are appended in member order and nothing
else happens to them. No feature is combined with another, no property is
inspected, and no member is treated as related to any other. Which features
belong to the same logical thing is the consuming app's decision, not a
parser's — `readGeoFile` reports what the archive holds.

That makes the two forms of the same export agree. The Deere producer sent
the same 74 fields twice: once as 74 single-feature members, which throws
today, and once as a single member holding 74 features, which parses today
into a 74-feature collection. After this change both yield 74 features.
`Multiple shape files not supported.` is deleted.

The coerce step is not ceremony: `parseZip` also treats `.json` members as
layers, and one can parse to something that is not a `FeatureCollection`. A
member that coerces to `null` is skipped rather than throwing, so a stray
`.json` beside good shapefiles does not fail the whole archive.

Because the result is built fresh, the collection-level `fileName` is gone by
construction and `withoutProperty` is no longer needed here.

**Errors.** `Shape data not found.` stays, wired to the condition that
actually happens: shpjs's `no layers founds` is caught and rethrown as it, and
it is also thrown when every member coerced away — that is, when
`coerceFeatureCollection` returned `null` for every one of them.

That is deliberately *not* the same as "the archive yielded no features". A zip
holding one shapefile with zero records is a legal export, the one a producer
gets when the selection was empty. Its single member coerces fine and simply
holds nothing, so it resolves to an empty `FeatureCollection` — which is what
`readGeoFile` has always returned for that file, and what the library's own
`no-empty-feature-collection.validator` exists to judge. Turning it into a
parse failure would be a regression.

Any other `parseZip` failure propagates unchanged.

## 2. The member name rides on each feature

Each feature gets the archive member it came from written into its
`properties`:

```ts
export const GEO_FILE_SOURCE_NAME_PROPERTY = 'seamSourceFileName'
```

Exported so consumers reference the constant instead of typing the string,
which also makes the key cheap to change later. Branded to keep it clear of
producer `.dbf` columns.

The value is the **basename** — `5North_LOWPHOS_4021_SampleCou`, not
`boundaries/5North_LOWPHOS_4021_SampleCou`. The directory is an artifact of
how the producer zipped the export; the stem is the part an app can use as a
default name. For the prescription export it is the only usable name at all,
since that file's `.dbf` properties are a single zero-valued nutrient column.

Written on every zip member, single or multiple, so the contract does not
depend on how the producer chose to export. Not written by `parseShpFile` (a
bare `.shp` carries no member name) or by `parseGeoJson`.

This is a widening of `readGeoFile`'s output contract: every feature from a
zip now carries one more property, and consumers that persist the collection
persist it too. That is the intent — once the members are concatenated there
is no other route back to the member name.

## 3. Drop routes through `fileImportHandler`

`map-file-drop.component.ts` asks `_googleMaps.getFileInputHandler()` and
calls it when one is set, falling back to its current parse-and-`setValue`
otherwise. That is the shape `google-maps-upload-button-control.component.ts`
already uses, so both import routes obey the same hook and
`fileImportHandler` means "the consumer owns imported files" however the file
arrived.

This changes default behaviour for any consumer that sets
`fileImportHandler` and leaves `fileDropEnabled` at its default `true`. That
is the bug being fixed: today such a consumer silently gets
library-controlled behaviour on the drop path only.

The hook keeps its `(file: File) => void` shape. A parsed-shaped hook is the
better long-term contract — the handoff argues it, and the Cotton app will
call `readGeoFile` itself as its first line — but that is a call to make with
the other consumers in view, not one to settle inside this change.

**Zone.** The drop listeners are registered inside `runOutsideAngular`, so
everything the drop handler does currently runs outside Angular's zone,
including the `setValue`. The dispatch is wrapped in `_ngZone.run()` so the
consumer's handler and the error emission below re-enter Angular — a consumer
rendering a message from that callback would otherwise not see it update.

## 4. `fileImportError` output

```ts
export interface TheSeamMapFileImportError {
  file: File
  error: unknown
}

@Output() fileImportError = new EventEmitter<TheSeamMapFileImportError>()
```

Plumbed exactly like `deleteBlocked`: a `Subject` and `fileImportError$` on
`GoogleMapsService`, a public `notifyFileImportError(file, error)` for the two
child components to call, and `google-maps.component.ts` subscribing to emit.
Like `deleteBlocked$` it is a plain `Subject` with no replayed initial value,
so no `skip(1)`.

Both paths gain a `catch` — the drop's `.then` chain, and the upload button's
floating `this._importFile(file)`.

Both also report a multi-file selection, which neither can import. The refusal
happens before any handler is consulted, because `fileImportHandler` takes a
single file and cannot be handed several — so the consumer never sees them, and
this output is its only way to learn the pick was rejected. Both use the same
message, `Only one file can be imported at a time.`, so a consumer matching on
it needs one string rather than two.

A drop of something that is not files at all — selected text, a link, an image
dragged out of a page — stays silent. Nobody asked for an import and there is
no file to name.

Otherwise it fires only for parsing the library owns. Once a consumer's
`fileImportHandler` takes the file, the outcome is theirs to report.

Fixing item 1 removes the common cause but not the class: a corrupt file, a
`.zip` of something else, or malformed GeoJSON still reach it.

## 5. Testing

**Real bytes for the parsing.** A `shapefile-fixture` test helper builds
minimal `.shp` and `.dbf` members and a stored (uncompressed) zip in memory,
so `read-geo-file.spec.ts` runs the real `file-type` and the real `shpjs` over
real bytes. The values are invented; no customer file enters the repo, and no
opaque binary is checked in — the generator is reviewable source.

This is worth its roughly 200 lines because the existing specs mock `shpjs`
wholesale, which means they assert our concatenation logic against our belief
about shpjs's return shape. Three of the four facts above contradict what those
mocks currently encode, and the shpjs v6 ESM upgrade on this branch is a
recent reminder that the belief can go stale without a test noticing.

The helper is feasible because of what the dependencies do not check:
`but-unzip` reads stored entries and never verifies a CRC, and no `.shx` is
needed. It must, however, match `parsedbf`'s quirk of locating the first
record at `32 * (fields + 1) + 2` rather than at the header's declared
length. Field types are `C` and `N`, enough for the string and numeric
columns the real exports carry.

Covered: both archive shapes the real producer files take — several
single-feature members, and one member holding many features — plus an
archive with no `.shp` at all, the member-name property, and the
directory-prefix stripping. The existing mocked
specs stay for the GeoJSON and bare-`.shp` routes, minus the
multiple-shapefile rejection they currently pin.

**Jest for the map wiring.** `google-maps/**` is already enabled in
`jest.config.ts`. Specs cover drop-with-handler, drop-without-handler, and
error emission from both import paths. No story changes — nothing here is
visual.

## Not doing

- **A parsed-shaped import hook.** Reasoned about in section 3.
The `items[0]` multi-file TODO in `_handleDropEvent` **was** resolved, and is
covered in section 4. For the record, the handoff described the drop path as
silently taking the first of several files; it does not. The guard required
`dataTransfer.files.length === 1`, so a multi-file drop was already refused
outright — `items[0]` is only ever reached when there is exactly one file. The
behaviour was safe, just silent, and the TODO was waiting for somewhere to
report to. Section 4 is that somewhere, so the guard was split: the file-count
half now reports, and the is-this-a-file-drag half stays silent.
