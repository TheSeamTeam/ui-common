/// <reference types="geojson" />

declare module 'shpjs' {
  /**
   * Buffer-like values accepted by shpjs. Internally these are normalized with
   * `new DataView(...)` / `new Uint8Array(...)`, so any `ArrayBuffer` or
   * `ArrayBuffer` view (`DataView`, `Uint8Array`, etc.) works.
   */
  export type ShpJSBuffer = ArrayBuffer | ArrayBufferView

  /**
   * `parseZip` tags each parsed layer with the name of the file it came from.
   */
  export interface FeatureCollectionWithFilename
    extends GeoJSON.FeatureCollection {
    fileName?: string
  }

  /**
   * Parses the geometry records of a `.shp` file.
   *
   * `prj` is the contents of the sibling `.prj` file. When provided, the
   * coordinates are reprojected to WGS84; when omitted, they are returned as
   * they are stored in the file.
   *
   * Note: this is synchronous, unlike its `parseZip` sibling.
   */
  export function parseShp(
    shp: ShpJSBuffer,
    prj?: string | ShpJSBuffer,
  ): GeoJSON.Geometry[]

  /**
   * Parses the attribute records of a `.dbf` file.
   *
   * `cpg` is the contents of the sibling `.cpg` file, naming the encoding the
   * attributes are stored in.
   */
  export function parseDbf(
    dbf: ShpJSBuffer,
    cpg?: string | ShpJSBuffer,
  ): GeoJSON.GeoJsonProperties[]

  /**
   * Parses a zipped shapefile bundle. Returns the layer directly when the
   * archive holds exactly one, and an array when it holds several.
   *
   * `whiteList` adds file extensions to treat as additional layers beyond the
   * `.shp` and `.json` members that are always read.
   */
  export function parseZip(
    buffer: ShpJSBuffer,
    whiteList?: readonly string[],
  ): Promise<FeatureCollectionWithFilename | FeatureCollectionWithFilename[]>

  /**
   * Zips already-parsed geometries together with their attribute records into a
   * `FeatureCollection`. Geometries without a matching attribute record get
   * empty properties.
   */
  export function combine(
    arr: [readonly GeoJSON.Geometry[], (readonly GeoJSON.GeoJsonProperties[])?],
  ): GeoJSON.FeatureCollection

  /**
   * Loads a shapefile from a URL base name, or parses one from a buffer.
   *
   * This is also the module's default export.
   */
  export function getShapefile(
    base: string | ShpJSBuffer,
    whiteList?: readonly string[],
  ): Promise<FeatureCollectionWithFilename | FeatureCollectionWithFilename[]>

  export default getShapefile
}
