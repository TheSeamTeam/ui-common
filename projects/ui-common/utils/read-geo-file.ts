import { isDevMode } from '@angular/core'
import fileType from '@marklb/file-type'
import { FeatureCollection } from 'geojson'
const Buffer = require('buffer/').Buffer
import shp from 'shpjs'

import { readFileAsync } from './file-utils'
import { withoutProperty } from './obj-utils'

/**
 * Reads a File, or buffer of file content, in GeoJSON or ESRI Shapefile format
 * and returns a GeoJSON `FeatureCollection`.
 */
export async function readGeoFile(fileOrBuffer: File | ArrayBuffer | Buffer): Promise<FeatureCollection> {
  const buffer = await coerceFileOrBufferToBuffer(fileOrBuffer)
  console.log('buffer', buffer)

  if (isShpFile(buffer)) {
    return await parseShpFile(buffer)
  } else if (fileType(buffer)?.mime === 'application/zip') {
    try {
      return await parseShpZip(buffer)
    } catch (e) {
      // NOTE: If 'shpjs' updates or we switch to a fork, where it doesn't use
      // node buffers, then we can remove this rethrow.
      if (isDevMode()) {
        if (e.message === 'nodebuffer is not supported by this platform') {
          console.warn(
            'Try adding Buffer polyfill.\n' +
            'Install: npm install buffer\n' +
            'Add `global.Buffer = global.Buffer || require(\'buffer\').Buffer` to "src/polyfills.ts"'
          )
        }
      }
      throw e
    }
  }

  return parseGeoJson(buffer)
}

async function coerceFileOrBufferToBuffer(fileOrBuffer: File | ArrayBuffer | Buffer): Promise<Buffer> {
  if (fileOrBuffer instanceof File) {
    const arrBuf = await readFileAsync(fileOrBuffer)
    return Buffer.from(arrBuf)
  }

  return Buffer.from(fileOrBuffer)
}

// NOTE: Our current version of file-type does not detect shp files. We can
// remove this function when file-types is upgraded.
function isShpFile(buffer: Buffer): boolean {
  const header = [ 0x27, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]
  const offset = 2

  if (buffer.length < (header.length + offset)) {
    return false
  }

  for (let i = 0; i < header.length; i++) {
    if (header[i] !== buffer[i + offset]) {
      return false
    }
  }

  return true
}

async function parseShpFile(buffer: Buffer): Promise<FeatureCollection> {
  const geometries = await shp.parseShp(buffer, undefined as any)
  const featCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: geometries.map(geom => ({
      type: 'Feature',
      geometry: geom,
      properties: { }
    }))
  }
  return featCollection
}

async function parseShpZip(buffer: Buffer): Promise<FeatureCollection> {
  let featCollection = await shp.parseZip(buffer, undefined as any)
  if (Array.isArray(featCollection)) {
    if (featCollection.length === 0) {
      throw Error(`Shape data not found.`)
    } else if (featCollection.length > 1) {
      throw Error(`Multiple shape files not supported.`)
    }
    featCollection = featCollection[0]
  }
  console.log('featCollection', featCollection)
  return withoutProperty(featCollection, 'fileName')
}

function parseGeoJson(buffer: Buffer): FeatureCollection {
  const json = JSON.parse(buffer.toString())

  if (json?.type === 'FeatureCollection' && Array.isArray(json?.features)) {
    return json as FeatureCollection
  }

  throw Error(`Unable to parse as GeoJSON.`)
}
