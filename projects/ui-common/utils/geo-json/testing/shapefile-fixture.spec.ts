import { parseZip } from 'shpjs'

import { shapefileZip, toArrayBuffer } from './shapefile-fixture'

const square = (x: number, y: number): [number, number][] => [
  [x, y],
  [x, y + 1],
  [x + 1, y + 1],
  [x + 1, y],
  [x, y],
]

describe('shapefileZip', () => {
  it('should build an archive shpjs reads as several layers', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/NorthQuarter',
        polygons: [square(0, 0)],
        properties: [{ FIELD_NAME: 'North Quarter', ACRES: 12 }],
      },
      {
        name: 'boundaries/SouthQuarter',
        polygons: [square(2, 0)],
        properties: [{ FIELD_NAME: 'South Quarter', ACRES: 9 }],
      },
    ])

    const parsed = await parseZip(toArrayBuffer(zip))

    expect(Array.isArray(parsed)).toBe(true)
    const layers = parsed as any[]
    expect(layers).toHaveLength(2)
    expect(layers[0].fileName).toBe('boundaries/NorthQuarter')
    expect(layers[0].features).toHaveLength(1)
    expect(layers[0].features[0].geometry.type).toBe('Polygon')
    expect(layers[0].features[0].geometry.coordinates).toEqual([square(0, 0)])
    expect(layers[0].features[0].properties).toEqual({
      FIELD_NAME: 'North Quarter',
      ACRES: 12,
    })
    expect(layers[1].fileName).toBe('boundaries/SouthQuarter')
  })

  it('should build an archive shpjs reads as one layer of many features', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/boundaries',
        polygons: [square(0, 0), square(2, 0), square(4, 0)],
        properties: [
          { FIELD_NAME: 'North Quarter' },
          { FIELD_NAME: 'South Quarter' },
          { FIELD_NAME: 'East Quarter' },
        ],
      },
    ])

    const parsed = (await parseZip(toArrayBuffer(zip))) as any

    expect(Array.isArray(parsed)).toBe(false)
    expect(parsed.fileName).toBe('boundaries/boundaries')
    expect(parsed.features).toHaveLength(3)
    expect(parsed.features[2].properties).toEqual({
      FIELD_NAME: 'East Quarter',
    })
  })

  it('should keep a zero-valued numeric property numeric', async () => {
    const zip = shapefileZip([
      {
        name: '4Tower_HICALCI_3833_HenryCou',
        polygons: [square(0, 0)],
        properties: [{ 'HI-CALCIUM': 0 }],
      },
    ])

    const parsed = (await parseZip(toArrayBuffer(zip))) as any

    expect(parsed.features[0].properties).toEqual({ 'HI-CALCIUM': 0 })
  })

  it('should build an archive shpjs rejects when it holds no shapefile', async () => {
    const zip = shapefileZip([])

    await expect(parseZip(toArrayBuffer(zip))).rejects.toThrow(
      'no layers founds',
    )
  })
})
