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
    // Counter-clockwise, so the GeoJSON export writes it unchanged.
    coordinates: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ],
    ],
  },
}
const collection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [square],
}

async function blobText(blob: Blob): Promise<string> {
  const buf = await readFileAsync(blob)
  return new TextDecoder().decode(new Uint8Array(buf as ArrayBuffer))
}

describe('geo-export', () => {
  describe('exportGeoJson', () => {
    it('writes the collection as application/geo+json', async () => {
      const file = exportGeoJson(collection)
      expect(file.blob.type).toBe('application/geo+json')
      expect(JSON.parse(await blobText(file.blob))).toEqual(collection)
    })

    it('orients polygon rings by the RFC 7946 right-hand rule', async () => {
      // Outer ring clockwise and hole counter-clockwise: both backwards.
      const outer = [
        [0, 0, 5],
        [0, 10, 5],
        [10, 10, 5],
        [10, 0, 5],
        [0, 0, 5],
      ]
      const hole = [
        [2, 2],
        [4, 2],
        [4, 4],
        [2, 4],
        [2, 2],
      ]
      const input: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'A' },
            geometry: { type: 'Polygon', coordinates: [outer, hole] },
          },
          {
            type: 'Feature',
            properties: { name: 'B' },
            geometry: { type: 'MultiPolygon', coordinates: [[outer]] },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: [1, 2] },
          },
        ],
      }
      const before = JSON.parse(JSON.stringify(input))

      const out = JSON.parse(await blobText(exportGeoJson(input).blob))

      const reversedOuter = [...outer].reverse()
      const reversedHole = [...hole].reverse()
      expect(out.features[0].geometry.coordinates).toEqual([
        reversedOuter,
        reversedHole,
      ])
      expect(out.features[1].geometry.coordinates).toEqual([[reversedOuter]])
      expect(out.features[2]).toEqual(input.features[2])
      expect(out.features[0].properties).toEqual({ name: 'A' })
      expect(input).toEqual(before)
    })

    it('leaves rings that already follow the right-hand rule unchanged', async () => {
      const ccw = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ]
      const input: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Polygon', coordinates: [ccw] },
          },
        ],
      }
      const out = JSON.parse(await blobText(exportGeoJson(input).blob))
      expect(out).toEqual(input)
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
      expect(await blobText(file.blob)).toContain('North_Farm.shp')
    })

    it('lets an explicit layerName override', async () => {
      const file = await exportShapefile(collection, {
        filename: 'North/Farm',
        layerName: 'Custom',
      })
      const text = await blobText(file.blob)
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
