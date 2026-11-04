import { fileTypeFromBuffer } from 'file-type'
import { FeatureCollection } from 'geojson'

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

function parseGeoJson(buffer: ArrayBuffer): FeatureCollection {
  const json = JSON.parse(new TextDecoder().decode(buffer))

  if (json?.type === 'FeatureCollection' && Array.isArray(json?.features)) {
    return json as FeatureCollection
  }

  throw Error(`Unable to parse as GeoJSON.`)
}
