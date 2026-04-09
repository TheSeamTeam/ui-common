import { FeatureCollection } from 'geojson'

jest.mock('file-type', () => ({
  fileTypeFromBuffer: jest.fn(),
}))

jest.mock('shpjs', () => ({
  __esModule: true,
  default: {
    parseShp: jest.fn(),
    parseZip: jest.fn(),
  },
}))

import { fileTypeFromBuffer } from 'file-type'
import shp from 'shpjs'

import { readGeoFile } from './read-geo-file'

const mockFileTypeFromBuffer = fileTypeFromBuffer as jest.Mock
const mockParseShp = shp.parseShp as jest.Mock
const mockParseZip = shp.parseZip as jest.Mock

const sampleFeatureCollection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: { name: 'test' },
    },
  ],
}

describe('readGeoFile', () => {
  beforeEach(() => {
    mockFileTypeFromBuffer.mockReset()
    mockParseShp.mockReset()
    mockParseZip.mockReset()
  })

  describe('GeoJSON parsing', () => {
    it('should parse a GeoJSON ArrayBuffer', async () => {
      mockFileTypeFromBuffer.mockResolvedValue(undefined)
      const json = JSON.stringify(sampleFeatureCollection)
      const buffer = new TextEncoder().encode(json).buffer

      const result = await readGeoFile(buffer as ArrayBuffer)

      expect(result.type).toBe('FeatureCollection')
      expect(result.features).toHaveLength(1)
      expect(result.features[0].properties).toEqual({ name: 'test' })
    })

    it('should throw for invalid GeoJSON', async () => {
      mockFileTypeFromBuffer.mockResolvedValue(undefined)
      const json = JSON.stringify({ type: 'Other', data: [] })
      const buffer = new TextEncoder().encode(json).buffer

      await expect(readGeoFile(buffer as ArrayBuffer)).rejects.toThrow(
        'Unable to parse as GeoJSON.',
      )
    })

    it('should throw for non-JSON content', async () => {
      mockFileTypeFromBuffer.mockResolvedValue(undefined)
      const buffer = new TextEncoder().encode('not json').buffer

      await expect(readGeoFile(buffer as ArrayBuffer)).rejects.toThrow()
    })
  })

  describe('SHP file parsing', () => {
    it('should route to parseShp when file-type detects shp', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'shp',
        mime: 'application/x-esri-shape',
      })

      const geometries = [
        { type: 'Point' as const, coordinates: [1, 2] },
        { type: 'Point' as const, coordinates: [3, 4] },
      ]
      mockParseShp.mockResolvedValue(geometries)

      const buffer = new ArrayBuffer(100)
      const result = await readGeoFile(buffer)

      expect(mockParseShp).toHaveBeenCalledWith(buffer, undefined)
      expect(result.type).toBe('FeatureCollection')
      expect(result.features).toHaveLength(2)
      expect(result.features[0].geometry).toEqual(geometries[0])
      expect(result.features[0].properties).toEqual({})
    })
  })

  describe('ZIP file parsing', () => {
    it('should route to parseZip when file-type detects zip', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      })
      mockParseZip.mockResolvedValue(sampleFeatureCollection)

      const buffer = new ArrayBuffer(100)
      const result = await readGeoFile(buffer)

      expect(mockParseZip).toHaveBeenCalledWith(buffer, undefined)
      expect(result.type).toBe('FeatureCollection')
    })

    it('should handle parseZip returning an array with one collection', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      })
      mockParseZip.mockResolvedValue([
        { ...sampleFeatureCollection, fileName: 'test.shp' },
      ])

      const buffer = new ArrayBuffer(100)
      const result = await readGeoFile(buffer)

      expect(result.type).toBe('FeatureCollection')
      expect(result).not.toHaveProperty('fileName')
    })

    it('should throw when parseZip returns empty array', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      })
      mockParseZip.mockResolvedValue([])

      const buffer = new ArrayBuffer(100)

      await expect(readGeoFile(buffer)).rejects.toThrow('Shape data not found.')
    })

    it('should throw when parseZip returns multiple collections', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      })
      mockParseZip.mockResolvedValue([
        sampleFeatureCollection,
        sampleFeatureCollection,
      ])

      const buffer = new ArrayBuffer(100)

      await expect(readGeoFile(buffer)).rejects.toThrow(
        'Multiple shape files not supported.',
      )
    })
  })

  describe('File input', () => {
    it('should read a File and parse as GeoJSON', async () => {
      mockFileTypeFromBuffer.mockResolvedValue(undefined)
      const json = JSON.stringify(sampleFeatureCollection)
      const file = new File([json], 'test.geojson', {
        type: 'application/geo+json',
      })

      const result = await readGeoFile(file)

      expect(result.type).toBe('FeatureCollection')
      expect(result.features).toHaveLength(1)
    })
  })
})
