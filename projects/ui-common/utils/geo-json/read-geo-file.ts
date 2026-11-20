import { fileTypeFromBuffer } from 'file-type'
import { Feature, FeatureCollection, Geometry } from 'geojson'

import { readFileAsync } from '../file-utils'
import { readShpFile, readShpZip } from '../shp/read-shapefile'

export { GEO_FILE_SOURCE_NAME_PROPERTY } from '../shp/read-shapefile'

/**
 * Reads a File, or buffer of file content, in GeoJSON or ESRI Shapefile format
 * and returns a GeoJSON `FeatureCollection`.
 */
export async function readGeoFile(
  fileOrBuffer: File | ArrayBuffer,
): Promise<FeatureCollection> {
  const buffer = await coerceToArrayBuffer(fileOrBuffer)
  const fType = await fileTypeFromBuffer(buffer)

  if (fType?.ext === 'shp') {
    return readShpFile(buffer)
  } else if (fType?.mime === 'application/zip') {
    return readShpZip(buffer)
  }

  return parseGeoJson(buffer)
}

async function coerceToArrayBuffer(
  fileOrBuffer: File | ArrayBuffer,
): Promise<ArrayBuffer> {
  if (fileOrBuffer instanceof File) {
    const arrBuf = await readFileAsync(fileOrBuffer)
    if (arrBuf === null) {
      throw new Error('Could not read file.')
    }
    return arrBuf
  }

  return fileOrBuffer
}

const GEOMETRY_TYPES = new Set<Geometry['type']>([
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
])

/**
 * Parses GeoJSON text into a `FeatureCollection`.
 *
 * RFC 7946 §2 allows the top-level object to be a FeatureCollection, a
 * Feature, or a bare Geometry, so a Feature is wrapped in a collection and a
 * Geometry is wrapped in a Feature first.
 */
function parseGeoJson(buffer: ArrayBuffer): FeatureCollection {
  const json = JSON.parse(new TextDecoder().decode(buffer))

  if (json?.type === 'FeatureCollection' && Array.isArray(json?.features)) {
    return json as FeatureCollection
  }

  if (json?.type === 'Feature' && json?.geometry !== undefined) {
    return { type: 'FeatureCollection', features: [json as Feature] }
  }

  if (isGeometry(json)) {
    return {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: json, properties: {} }],
    }
  }

  throw Error(`Unable to parse as GeoJSON.`)
}

function isGeometry(value: any): value is Geometry {
  if (value?.type === 'GeometryCollection') {
    return Array.isArray(value?.geometries)
  }
  return GEOMETRY_TYPES.has(value?.type) && Array.isArray(value?.coordinates)
}
