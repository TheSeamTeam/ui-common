import { fileTypeFromBuffer } from 'file-type'
import { FeatureCollection } from 'geojson'
import shp from 'shpjs'

import { readFileAsync } from '../file-utils'
import { withoutProperty } from '../obj-utils'

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
    return parseShpFile(buffer)
  } else if (fType?.mime === 'application/zip') {
    return parseShpZip(buffer)
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

async function parseShpFile(buffer: ArrayBuffer): Promise<FeatureCollection> {
  const geometries = await shp.parseShp(buffer, undefined as any)
  const featCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: geometries.map((geom) => ({
      type: 'Feature',
      geometry: geom,
      properties: {},
    })),
  }
  return featCollection
}

async function parseShpZip(buffer: ArrayBuffer): Promise<FeatureCollection> {
  let featCollection = await shp.parseZip(buffer, undefined as any)
  if (Array.isArray(featCollection)) {
    if (featCollection.length === 0) {
      throw Error(`Shape data not found.`)
    } else if (featCollection.length > 1) {
      throw Error(`Multiple shape files not supported.`)
    }
    featCollection = featCollection[0]
  }
  return withoutProperty(featCollection, 'fileName')
}

function parseGeoJson(buffer: ArrayBuffer): FeatureCollection {
  const json = JSON.parse(new TextDecoder().decode(buffer))

  if (json?.type === 'FeatureCollection' && Array.isArray(json?.features)) {
    return json as FeatureCollection
  }

  throw Error(`Unable to parse as GeoJSON.`)
}
