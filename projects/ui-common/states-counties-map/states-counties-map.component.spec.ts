import { createComponentFactory, Spectator } from '@ngneat/spectator/jest'
import type { Topology } from 'topojson-specification'

import { TheSeamStatesCountiesMapComponent } from './states-counties-map.component'
import { TheSeamStatesCountiesMapDataService } from './states-counties-map-data.service'

// Smallest valid topology with a states layer and a counties layer.
// Geometry is not used by these tests — we're only asserting wiring.
const emptyTopology: Topology = {
  type: 'Topology',
  arcs: [],
  objects: {
    states: {
      type: 'GeometryCollection',
      geometries: [],
    },
    counties: {
      type: 'GeometryCollection',
      geometries: [],
    },
  },
}

// jsdom does not implement ResizeObserver — the component constructs one,
// so stub it before the component is instantiated.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
beforeAll(() => {
  ;(
    globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }
  ).ResizeObserver = ResizeObserverStub
})

describe('TheSeamStatesCountiesMapComponent', () => {
  let loadSpy: jest.Mock<Promise<Topology>, [string?]>

  const createComponent = createComponentFactory({
    component: TheSeamStatesCountiesMapComponent,
    providers: [
      {
        provide: TheSeamStatesCountiesMapDataService,
        useFactory: () => ({ load: loadSpy }),
      },
    ],
  })

  let spectator: Spectator<TheSeamStatesCountiesMapComponent>

  beforeEach(() => {
    loadSpy = jest.fn().mockResolvedValue(emptyTopology)
  })

  it('renders a wrapper element with the expected class', () => {
    spectator = createComponent()
    expect(spectator.query('.states-counties-map-wrapper')).toBeTruthy()
  })

  it('does not load the topology until a state number is provided', () => {
    spectator = createComponent()
    expect(loadSpy).not.toHaveBeenCalled()
  })

  it('loads the topology once a state number is provided', async () => {
    spectator = createComponent({
      props: { stateNumber: '48' },
    })
    // Allow the async render pipeline to kick off.
    await Promise.resolve()
    expect(loadSpy).toHaveBeenCalledTimes(1)
  })
})
