import { shapefileZip, toArrayBuffer } from './testing/shapefile-fixture'

import { GEO_FILE_SOURCE_NAME_PROPERTY, readGeoFile } from './read-geo-file'

const square = (x: number, y: number): [number, number][] => [
  [x, y],
  [x, y + 1],
  [x + 1, y + 1],
  [x + 1, y],
  [x, y],
]

describe('readGeoFile with real shapefile archives', () => {
  it('should concatenate the features of every member', async () => {
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
      {
        name: 'boundaries/EastQuarter',
        polygons: [square(4, 0)],
        properties: [{ FIELD_NAME: 'East Quarter', ACRES: 21 }],
      },
    ])

    const result = await readGeoFile(toArrayBuffer(zip))

    expect(result.type).toBe('FeatureCollection')
    expect(result.features).toHaveLength(3)
    expect(result.features.map((f) => f.properties?.['FIELD_NAME'])).toEqual([
      'North Quarter',
      'South Quarter',
      'East Quarter',
    ])
  })

  it('should give the same features however the producer exported them', async () => {
    const perField = shapefileZip([
      {
        name: 'boundaries/NorthQuarter',
        polygons: [square(0, 0)],
        properties: [{ FIELD_NAME: 'North Quarter' }],
      },
      {
        name: 'boundaries/SouthQuarter',
        polygons: [square(2, 0)],
        properties: [{ FIELD_NAME: 'South Quarter' }],
      },
    ])
    const oneFile = shapefileZip([
      {
        name: 'boundaries/boundaries',
        polygons: [square(0, 0), square(2, 0)],
        properties: [
          { FIELD_NAME: 'North Quarter' },
          { FIELD_NAME: 'South Quarter' },
        ],
      },
    ])

    const fromPerField = await readGeoFile(toArrayBuffer(perField))
    const fromOneFile = await readGeoFile(toArrayBuffer(oneFile))

    expect(fromPerField.features).toHaveLength(2)
    expect(fromOneFile.features).toHaveLength(2)
    expect(fromPerField.features.map((f) => f.geometry)).toEqual(
      fromOneFile.features.map((f) => f.geometry),
    )
  })

  it('should tag each feature with its member basename', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/5North_LOWPHOS_4021_SampleCou',
        polygons: [square(0, 0)],
        properties: [{ 'LOW-PHOS': 0 }],
      },
      {
        name: '3East_POTMIX_4021_SampleCou',
        polygons: [square(2, 0)],
        properties: [{ POTMIX: 0 }],
      },
    ])

    const result = await readGeoFile(toArrayBuffer(zip))

    expect(
      result.features.map((f) => f.properties?.[GEO_FILE_SOURCE_NAME_PROPERTY]),
    ).toEqual(['5North_LOWPHOS_4021_SampleCou', '3East_POTMIX_4021_SampleCou'])
  })

  it('should tag a single-member archive the same way', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/boundaries',
        polygons: [square(0, 0), square(2, 0)],
        properties: [{ FIELD_NAME: 'North' }, { FIELD_NAME: 'South' }],
      },
    ])

    const result = await readGeoFile(toArrayBuffer(zip))

    expect(
      result.features.map((f) => f.properties?.[GEO_FILE_SOURCE_NAME_PROPERTY]),
    ).toEqual(['boundaries', 'boundaries'])
  })

  it('should keep the producer properties alongside the source name', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/NorthQuarter',
        polygons: [square(0, 0)],
        properties: [{ FIELD_NAME: 'North Quarter', ACRES: 12 }],
      },
    ])

    const result = await readGeoFile(toArrayBuffer(zip))

    expect(result.features[0].properties).toEqual({
      FIELD_NAME: 'North Quarter',
      ACRES: 12,
      [GEO_FILE_SOURCE_NAME_PROPERTY]: 'NorthQuarter',
    })
  })

  it('should not leave fileName on the returned collection', async () => {
    const zip = shapefileZip([
      {
        name: 'boundaries/boundaries',
        polygons: [square(0, 0)],
        properties: [{ FIELD_NAME: 'North' }],
      },
    ])

    const result = await readGeoFile(toArrayBuffer(zip))

    expect(result).not.toHaveProperty('fileName')
  })

  it('should throw Shape data not found for an archive with no shapefile', async () => {
    const zip = shapefileZip([])

    await expect(readGeoFile(toArrayBuffer(zip))).rejects.toThrow(
      'Shape data not found.',
    )
  })
})
