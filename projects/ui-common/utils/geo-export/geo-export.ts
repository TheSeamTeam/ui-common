import FileSaver from 'file-saver'
import type { FeatureCollection } from 'geojson'
import { sanitizeFilename } from '../sanitize-filename'
import { toShapefileZip } from '../shp/to-shapefile-zip'
import { rewindToRightHandRule } from './right-hand-rule'

export interface TheSeamGeoExportFile {
  blob: Blob
  filename: string
}

export interface TheSeamGeoJsonExportOptions {
  /** Base file name. Default 'boundaries'. A trailing .geojson/.json is ignored. */
  filename?: string
}

export interface TheSeamShapefileExportOptions {
  /** Base file name. Default 'boundaries'. A trailing .zip is ignored. */
  filename?: string
  /** Base name of the files inside the zip. Defaults to the sanitized base file name. */
  layerName?: string
}

const DEFAULT_BASE_NAME = 'boundaries'

function baseName(filename: string | undefined, extension: RegExp): string {
  const stripped = (filename ?? DEFAULT_BASE_NAME).replace(extension, '')
  return sanitizeFilename(stripped) || DEFAULT_BASE_NAME
}

/**
 * Packages a FeatureCollection as a GeoJSON file.
 *
 * Polygon and MultiPolygon rings are written in the RFC 7946 right-hand-rule
 * direction (outer counter-clockwise, holes clockwise), whatever direction the
 * input used. Nothing else changes: no other geometry or attribute rules are
 * applied, and the input is not mutated.
 *
 * Intended app flow: `TheSeamGoogleMapsComponent.getGeoJson()`, then
 * `mapFeaturesForExport(collection, f => props | null)` to filter features and
 * set their attributes, then `exportGeoJson`, then `saveGeoExportFile`.
 * Toasts and error display are left to the app.
 */
export function exportGeoJson(
  collection: FeatureCollection,
  options?: TheSeamGeoJsonExportOptions,
): TheSeamGeoExportFile {
  if (
    !collection ||
    collection.type !== 'FeatureCollection' ||
    !Array.isArray(collection.features)
  ) {
    throw new Error('Expected a GeoJSON FeatureCollection.')
  }
  const base = baseName(options?.filename, /\.(geojson|json)$/i)
  return {
    blob: new Blob([JSON.stringify(rewindToRightHandRule(collection))], {
      type: 'application/geo+json',
    }),
    filename: `${base}.geojson`,
  }
}

/**
 * Packages polygon features as a zipped shapefile.
 *
 * Intended app flow: `TheSeamGoogleMapsComponent.getGeoJson()`, then
 * `mapFeaturesForExport(collection, f => props | null)` to filter features and
 * set their attributes, then `exportShapefile`, then `saveGeoExportFile`.
 * Toasts and error display are left to the app.
 */
export async function exportShapefile(
  collection: FeatureCollection,
  options?: TheSeamShapefileExportOptions,
): Promise<TheSeamGeoExportFile> {
  const base = baseName(options?.filename, /\.zip$/i)
  const blob = await toShapefileZip(collection, {
    layerName: options?.layerName ?? base,
  })
  return { blob, filename: `${base}.zip` }
}

/** Downloads the file in the browser. */
export function saveGeoExportFile(file: TheSeamGeoExportFile): void {
  FileSaver.saveAs(file.blob, file.filename)
}
