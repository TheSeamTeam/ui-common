import { TestBed } from '@angular/core/testing'

import {
  provideStatesCountiesMap,
  THE_SEAM_STATES_COUNTIES_MAP_DEFAULT_URL,
} from './states-counties-map-config'
import { TheSeamStatesCountiesMapDataService } from './states-counties-map-data.service'

describe('TheSeamStatesCountiesMapDataService', () => {
  const fakeTopology = { type: 'Topology', objects: {} } as const
  let fetchSpy: jest.SpyInstance

  beforeEach(() => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify(fakeTopology), { status: 200 }),
      )
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  function createService(): TheSeamStatesCountiesMapDataService {
    return TestBed.inject(TheSeamStatesCountiesMapDataService)
  }

  it('fetches the default topology url when no config is provided', async () => {
    TestBed.configureTestingModule({})
    const service = createService()

    const result = await service.load()

    expect(fetchSpy).toHaveBeenCalledWith(
      THE_SEAM_STATES_COUNTIES_MAP_DEFAULT_URL,
    )
    expect(result).toEqual(fakeTopology)
  })

  it('fetches the configured url when provideStatesCountiesMap is used', async () => {
    TestBed.configureTestingModule({
      providers: [provideStatesCountiesMap({ topologyUrl: '/custom.json' })],
    })
    const service = createService()

    await service.load()

    expect(fetchSpy).toHaveBeenCalledWith('/custom.json')
  })

  it('memoizes results by url so repeat loads do not refetch', async () => {
    TestBed.configureTestingModule({})
    const service = createService()

    const first = await service.load()
    const second = await service.load()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(second).toBe(first)
  })

  it('accepts an explicit url override per call', async () => {
    TestBed.configureTestingModule({})
    const service = createService()

    await service.load('/a.json')
    await service.load('/b.json')
    await service.load('/a.json')

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(fetchSpy).toHaveBeenNthCalledWith(1, '/a.json')
    expect(fetchSpy).toHaveBeenNthCalledWith(2, '/b.json')
  })

  it('throws when the response is not ok', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('nope', { status: 404 }))
    TestBed.configureTestingModule({})
    const service = createService()

    await expect(service.load()).rejects.toThrow(/404/)
  })
})
