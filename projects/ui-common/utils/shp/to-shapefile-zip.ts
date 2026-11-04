import type { Feature, FeatureCollection } from 'geojson'
import { sanitizeFilename } from '../sanitize-filename'
import { toShapefileRings } from './shapefile-rings'
import { writeDbf } from './write-dbf'
import { writeShpAndShx } from './write-shp'
import { writeStoredZip } from './write-zip'

export interface TheSeamShapefileOptions {
  /** Base name of the files inside the zip. Default 'boundaries'. */
  layerName?: string
}

export const SHAPEFILE_WGS84_PRJ =
  'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]'

const DEFAULT_LAYER_NAME = 'boundaries'

/** Builds a zipped shapefile (.shp, .shx, .dbf, .prj, .cpg) from polygon features. */
export function writeShapefileZip(
  collection: FeatureCollection,
  options?: TheSeamShapefileOptions,
): Uint8Array {
  if (
    !collection ||
    collection.type !== 'FeatureCollection' ||
    !Array.isArray(collection.features)
  ) {
    throw new Error('Expected a GeoJSON FeatureCollection.')
  }
  if (collection.features.length === 0) {
    throw new Error('There are no features to export.')
  }

  const rings = collection.features.map((feature: Feature, i) => {
    const geometry = feature?.geometry
    if (
      !geometry ||
      (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')
    ) {
      throw new Error(
        `Feature ${i} has a ${geometry ? geometry.type : 'null'} geometry; only Polygon and MultiPolygon can be exported as a shapefile.`,
      )
    }
    return toShapefileRings(geometry, i)
  })

  const layer =
    sanitizeFilename(options?.layerName ?? DEFAULT_LAYER_NAME) ||
    DEFAULT_LAYER_NAME
  const encoder = new TextEncoder()
  const { shp, shx } = writeShpAndShx(rings)
  const dbf = writeDbf(collection.features.map((f) => f.properties))

  return writeStoredZip([
    { name: `${layer}.shp`, data: shp },
    { name: `${layer}.shx`, data: shx },
    { name: `${layer}.dbf`, data: dbf },
    { name: `${layer}.prj`, data: encoder.encode(SHAPEFILE_WGS84_PRJ) },
    { name: `${layer}.cpg`, data: encoder.encode('UTF-8') },
  ])
}

/** Same bytes as `writeShapefileZip`, as a Blob. Async so compression can be added later. */
export async function toShapefileZip(
  collection: FeatureCollection,
  options?: TheSeamShapefileOptions,
): Promise<Blob> {
  const bytes = writeShapefileZip(collection, options)
  return new Blob([bytes as BlobPart], { type: 'application/zip' })
}
