import { parseZip } from 'shpjs'
import type { Feature, FeatureCollection, Geometry, Polygon } from 'geojson'
import { readFileAsync } from '../file-utils'
import { toArrayBuffer } from './testing/shapefile-fixture'
import { toShapefileZip, writeShapefileZip } from './to-shapefile-zip'

function collection(features: Feature[]): FeatureCollection {
  return { type: 'FeatureCollection', features }
}

function feature(geometry: Geometry | null, properties = {}): Feature {
  return { type: 'Feature', geometry: geometry as Geometry, properties }
}

function square(x: number, y: number, size = 1): [number, number][] {
  return [
    [x, y],
    [x + size, y],
    [x + size, y + size],
    [x, y + size],
    [x, y],
  ]
}

async function read(zip: Uint8Array): Promise<FeatureCollection> {
  return (await parseZip(toArrayBuffer(zip))) as unknown as FeatureCollection
}

function entryNames(zip: Uint8Array): string[] {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength)
  const names: string[] = []
  let at = 0
  while (view.getUint32(at, true) === 0x04034b50) {
    const size = view.getUint32(at + 18, true)
    const nameLength = view.getUint16(at + 26, true)
    const extraLength = view.getUint16(at + 28, true)
    names.push(
      new TextDecoder().decode(zip.slice(at + 30, at + 30 + nameLength)),
    )
    at += 30 + nameLength + extraLength + size
  }
  return names
}

describe('writeShapefileZip', () => {
  it('keeps Polygon and MultiPolygon features together', async () => {
    const result = await read(
      writeShapefileZip(
        collection([
          feature(
            { type: 'Polygon', coordinates: [square(0, 0)] },
            { NAME: 'A' },
          ),
          feature(
            {
              type: 'MultiPolygon',
              coordinates: [[square(10, 10)], [square(20, 20)]],
            },
            { NAME: 'B' },
          ),
        ]),
      ),
    )

    expect(result.features.length).toBe(2)
    expect(result.features.map((f) => f.geometry.type)).toEqual([
      'Polygon',
      'MultiPolygon',
    ])
    expect(result.features.map((f) => f.properties?.['NAME'])).toEqual([
      'A',
      'B',
    ])
  })

  it.each([
    ['RFC 7946 direction', false],
    ['reversed direction', true],
  ])(
    'keeps holes whichever direction the input uses (%s)',
    async (_, reversed) => {
      const outer = square(0, 0, 10)
      const hole = square(2, 2, 3)
      const rings = reversed
        ? [[...outer].reverse(), [...hole].reverse()]
        : [outer, [...hole].reverse()]
      const result = await read(
        writeShapefileZip(
          collection([feature({ type: 'Polygon', coordinates: rings })]),
        ),
      )
      const geometry = result.features[0].geometry as Polygon

      expect(geometry.type).toBe('Polygon')
      expect(geometry.coordinates.length).toBe(2)
      expect(geometry.coordinates[1].length).toBe(hole.length)
      for (const [x, y] of geometry.coordinates[1]) {
        const match = hole.find(
          ([hx, hy]) => Math.abs(hx - x) < 1e-9 && Math.abs(hy - y) < 1e-9,
        )
        expect(match).toBeDefined()
        expect(x).toBeCloseTo(match![0], 9)
        expect(y).toBeCloseTo(match![1], 9)
      }
    },
  )

  it('writes all five members', () => {
    const input = collection([
      feature({ type: 'Polygon', coordinates: [square(0, 0)] }),
    ])

    expect(entryNames(writeShapefileZip(input))).toEqual([
      'boundaries.shp',
      'boundaries.shx',
      'boundaries.dbf',
      'boundaries.prj',
      'boundaries.cpg',
    ])
    expect(
      entryNames(writeShapefileZip(input, { layerName: 'my/fields' })),
    ).toEqual([
      'my_fields.shp',
      'my_fields.shx',
      'my_fields.dbf',
      'my_fields.prj',
      'my_fields.cpg',
    ])
  })

  it('does not mutate the input', () => {
    const input = collection([
      feature(
        { type: 'Polygon', coordinates: [square(0, 0).reverse()] },
        { NAME: 'A' },
      ),
    ])
    const before = JSON.parse(JSON.stringify(input))
    writeShapefileZip(input)

    expect(input).toEqual(before)
  })

  it('toShapefileZip returns an application/zip Blob with the same bytes', async () => {
    const input = collection([
      feature({ type: 'Polygon', coordinates: [square(0, 0)] }),
    ])
    const blob = await toShapefileZip(input)
    const buffer = await readFileAsync(blob)

    expect(blob.type).toBe('application/zip')
    expect(Array.from(new Uint8Array(buffer as ArrayBuffer))).toEqual(
      Array.from(writeShapefileZip(input)),
    )
  })

  it('throws for a non-collection', () => {
    expect(() => writeShapefileZip({} as FeatureCollection)).toThrow(
      'Expected a GeoJSON FeatureCollection.',
    )
    expect(() =>
      writeShapefileZip({ type: 'FeatureCollection' } as FeatureCollection),
    ).toThrow('Expected a GeoJSON FeatureCollection.')
  })

  it('throws for an empty collection', () => {
    expect(() => writeShapefileZip(collection([]))).toThrow(
      'There are no features to export.',
    )
  })

  it('throws for a null geometry', () => {
    expect(() =>
      writeShapefileZip(
        collection([
          feature({ type: 'Polygon', coordinates: [square(0, 0)] }),
          feature(null),
        ]),
      ),
    ).toThrow(/Feature 1 has a null geometry/)
  })

  it.each([
    ['Point', { type: 'Point', coordinates: [0, 0] }],
    ['GeometryCollection', { type: 'GeometryCollection', geometries: [] }],
  ])('throws for a %s geometry', (type, geometry) => {
    expect(() =>
      writeShapefileZip(collection([feature(geometry as Geometry)])),
    ).toThrow(`Feature 0 has a ${type} geometry`)
  })
})
