import { fileTypeFromBuffer } from 'file-type'
import { Feature, FeatureCollection } from 'geojson'
import { FeatureCollectionWithFilename, parseShp, parseZip } from 'shpjs'

import { readFileAsync } from '../file-utils'
import { coerceFeatureCollection } from './coerce-feature-collection'

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
  const geometries = parseShp(buffer)
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
  const lastSlash = Math.max(
    fileName.lastIndexOf('/'),
    fileName.lastIndexOf('\\'),
  )
  const name = lastSlash === -1 ? fileName : fileName.slice(lastSlash + 1)
  return name.length === 0 ? undefined : name
}

function parseGeoJson(buffer: ArrayBuffer): FeatureCollection {
  const json = JSON.parse(new TextDecoder().decode(buffer))

  if (json?.type === 'FeatureCollection' && Array.isArray(json?.features)) {
    return json as FeatureCollection
  }

  throw Error(`Unable to parse as GeoJSON.`)
}
