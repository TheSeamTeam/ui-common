import type { Feature, FeatureCollection } from 'geojson'
import FileSaver from 'file-saver'
import { readFileAsync } from '../file-utils'
import { exportGeoJson, exportShapefile, saveGeoExportFile } from './geo-export'

jest.mock('file-saver')

const square: Feature = {
  type: 'Feature',
  properties: { name: 'A' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ],
  },
}
const collection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [square],
}

async function zipText(blob: Blob): Promise<string> {
  const buf = await readFileAsync(blob)
  return new TextDecoder().decode(new Uint8Array(buf as ArrayBuffer))
}

describe('geo-export', () => {
  describe('exportGeoJson', () => {
    it('writes the collection as application/geo+json', async () => {
      const file = exportGeoJson(collection)
      expect(file.blob.type).toBe('application/geo+json')
      const buf = await readFileAsync(file.blob)
      const text = new TextDecoder().decode(new Uint8Array(buf as ArrayBuffer))
      expect(JSON.parse(text)).toEqual(collection)
    })

    it('accepts any FeatureCollection', () => {
      const points: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: [1, 2] },
          },
        ],
      }
      expect(() => exportGeoJson(points)).not.toThrow()
      expect(() => exportGeoJson({} as FeatureCollection)).toThrow(
        'Expected a GeoJSON FeatureCollection.',
      )
    })

    it('names files', () => {
      expect(exportGeoJson(collection).filename).toBe('boundaries.geojson')
      expect(
        exportGeoJson(collection, { filename: 'North Farm' }).filename,
      ).toBe('North Farm.geojson')
    })

    it('does not double the extension', () => {
      const name = (filename: string) =>
        exportGeoJson(collection, { filename }).filename
      expect(name('fields.GeoJSON')).toBe('fields.geojson')
      expect(name('fields.json')).toBe('fields.geojson')
    })
  })

  describe('exportShapefile', () => {
    it('names files', async () => {
      expect((await exportShapefile(collection)).filename).toBe(
        'boundaries.zip',
      )
      expect(
        (await exportShapefile(collection, { filename: 'a/b' })).filename,
      ).toBe('a_b.zip')
    })

    it('does not double the extension', async () => {
      expect(
        (await exportShapefile(collection, { filename: 'fields.zip' }))
          .filename,
      ).toBe('fields.zip')
      expect(
        (await exportShapefile(collection, { filename: 'fields.ZIP' }))
          .filename,
      ).toBe('fields.zip')
    })

    it('names the layer after the file', async () => {
      const file = await exportShapefile(collection, {
        filename: 'North/Farm',
      })
      expect(file.blob.type).toBe('application/zip')
      expect(await zipText(file.blob)).toContain('North_Farm.shp')
    })

    it('lets an explicit layerName override', async () => {
      const file = await exportShapefile(collection, {
        filename: 'North/Farm',
        layerName: 'Custom',
      })
      const text = await zipText(file.blob)
      expect(text).toContain('Custom.shp')
      expect(text).not.toContain('North_Farm.shp')
    })
  })

  describe('saveGeoExportFile', () => {
    it('saves the blob under its filename', async () => {
      const file = await exportShapefile(collection)
      saveGeoExportFile(file)
      expect(FileSaver.saveAs).toHaveBeenCalledWith(file.blob, 'boundaries.zip')
    })
  })
})
