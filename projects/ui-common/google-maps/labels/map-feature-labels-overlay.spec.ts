import {
  FakeMap,
  installFakeGoogleMaps,
  setFakeProjection,
  uninstallFakeGoogleMaps,
} from '../testing/fake-google-maps'
import {
  MAP_FEATURE_LABEL_CLASS,
  MapFeatureLabel,
  MapFeatureLabelsOverlay,
} from './map-feature-labels-overlay'

/**
 * jsdom reports every element as 0x0, so the overlay would never see a
 * collision. Report a fixed size per label instead, which is what a browser
 * would give for one line of text.
 */
const LABEL_WIDTH = 100
const LABEL_HEIGHT = 20

/**
 * The width every stubbed label reports. Mutable so a test can widen the
 * labels mid-run, the way a webfont finishing loading does.
 */
let labelWidth = LABEL_WIDTH

function stubLayout(): () => void {
  const defineSize = (name: string, value: number) => {
    const original = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      name,
    )
    Object.defineProperty(HTMLElement.prototype, name, {
      configurable: true,
      get(this: HTMLElement) {
        if (!this.textContent) {
          return 0
        }
        return name === 'offsetWidth' ? labelWidth : value
      },
    })
    return () => {
      if (original) {
        Object.defineProperty(HTMLElement.prototype, name, original)
      } else {
        delete (HTMLElement.prototype as any)[name]
      }
    }
  }
  const restores = [
    defineSize('offsetWidth', LABEL_WIDTH),
    defineSize('offsetHeight', LABEL_HEIGHT),
  ]
  return () => restores.forEach((restore) => restore())
}

/** A label spanning `size` degrees, anchored at `[lng, lat]`. */
function label(
  key: string,
  lng: number,
  lat: number,
  { size = 10, priority = 0, text = key } = {},
): MapFeatureLabel {
  const bounds = new google.maps.LatLngBounds()
  bounds.extend(new google.maps.LatLng(lat - size / 2, lng - size / 2))
  bounds.extend(new google.maps.LatLng(lat + size / 2, lng + size / 2))
  return {
    key,
    text,
    position: new google.maps.LatLng(lat, lng),
    bounds,
    priority,
  }
}

function elements(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(`.${MAP_FEATURE_LABEL_CLASS}`),
  )
}

function elementFor(text: string): HTMLElement | undefined {
  return elements().find((element) => element.textContent === text)
}

function attach(labels: MapFeatureLabel[]): MapFeatureLabelsOverlay {
  const overlay = new MapFeatureLabelsOverlay(() => labels)
  overlay.setMap(new FakeMap() as unknown as google.maps.Map)
  overlay.refresh()
  return overlay
}

describe('MapFeatureLabelsOverlay', () => {
  let restoreLayout: () => void

  beforeEach(() => {
    labelWidth = LABEL_WIDTH
    installFakeGoogleMaps()
    // 10 px per degree, so the default 10-degree label clears the size
    // threshold comfortably.
    setFakeProjection(10)
    restoreLayout = stubLayout()
  })

  afterEach(() => {
    restoreLayout()
    delete (document as unknown as { fonts?: unknown }).fonts
    uninstallFakeGoogleMaps()
  })

  it('renders a label at its anchor, not at the centre of its bounds', () => {
    // Bounds centred on [0, 0]; anchor deliberately off to one side, as a
    // concave polygon's label point would be.
    const bounds = new google.maps.LatLngBounds()
    bounds.extend(new google.maps.LatLng(-10, -10))
    bounds.extend(new google.maps.LatLng(10, 10))
    attach([
      {
        key: 'a',
        text: 'North 40',
        position: new google.maps.LatLng(0, 7),
        bounds,
        priority: 0,
      },
    ])

    expect(elementFor('North 40')?.style.left).toBe('70px')
  })

  it('hides a label whose shape is too small on screen', () => {
    attach([label('tiny', 0, 0, { size: 0.1 })])
    expect(elementFor('tiny')?.hidden).toBe(true)
  })

  it('leaves a lone label unmoved', () => {
    attach([label('a', 0, 0)])
    expect(elementFor('a')?.style.top).toBe('0px')
  })

  it('pushes a colliding label clear of the one that outranks it', () => {
    attach([
      label('low', 0, 0, { priority: 1 }),
      label('high', 0, 0, { priority: 5 }),
    ])

    expect(elementFor('high')?.style.top).toBe('0px')
    expect(elementFor('low')?.style.top).not.toBe('0px')
    expect(elementFor('low')?.hidden).toBe(false)
  })

  it('leaves labels far apart alone', () => {
    attach([label('a', 0, 0), label('b', 100, 0)])
    expect(elementFor('a')?.style.top).toBe('0px')
    expect(elementFor('b')?.style.top).toBe('0px')
  })

  it('hides a label it cannot place, rather than stacking it', () => {
    const crowd = Array.from({ length: 20 }, (_, i) =>
      label(`f${i}`, 0, 0, { priority: 20 - i }),
    )
    attach(crowd)

    const shown = elements().filter((element) => !element.hidden)
    expect(shown.length).toBeLessThan(crowd.length)
    expect(shown.length).toBeGreaterThan(1)
  })

  it('excludes a hidden label from collisions, so it displaces nothing', () => {
    // The tiny one is below the size threshold; the other should stay put.
    attach([
      label('tiny', 0, 0, { size: 0.1, priority: 9 }),
      label('big', 0, 0),
    ])
    expect(elementFor('big')?.style.top).toBe('0px')
    expect(elementFor('big')?.hidden).toBe(false)
  })

  it('re-measures labels whose rendered width changed, as a webfont swap does', () => {
    // Far enough apart not to collide at 100px wide, close enough to collide
    // at 200px. The first draw measures the narrow fallback font; the label
    // text never changes, so a cache keyed on text alone would keep deciding
    // collisions against metrics that are no longer on screen.
    const labels = [
      label('a', 0, 0, { priority: 5 }),
      label('b', 12, 0, { priority: 1 }),
    ]
    const overlay = attach(labels)
    expect(elementFor('a')?.style.top).toBe('0px')
    expect(elementFor('b')?.style.top).toBe('0px')

    labelWidth = 200
    overlay.refresh()

    expect(elementFor('a')?.style.top).toBe('0px')
    expect(elementFor('b')?.style.top).not.toBe('0px')
  })

  it('repaints when a font finishes loading, since that changes label widths', () => {
    // Not `document.fonts.ready`: that settles once, and the Maps API loads a
    // Roboto of its own after it has. `loadingdone` fires for that batch too.
    const listeners: (() => void)[] = []
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        addEventListener: (name: string, fn: () => void) => {
          if (name === 'loadingdone') {
            listeners.push(fn)
          }
        },
        removeEventListener: () => undefined,
      },
    })

    const labels = [
      label('a', 0, 0, { priority: 5 }),
      label('b', 12, 0, { priority: 1 }),
    ]
    attach(labels)
    expect(elementFor('b')?.style.top).toBe('0px')

    labelWidth = 200
    listeners.forEach((fn) => fn())

    expect(elementFor('a')?.style.top).toBe('0px')
    expect(elementFor('b')?.style.top).not.toBe('0px')
  })

  it('reuses the element for a key across refreshes', () => {
    const labels = [label('a', 0, 0, { text: 'before' })]
    const overlay = attach(labels)
    const first = elementFor('before')

    labels[0] = label('a', 0, 0, { text: 'after' })
    overlay.refresh()

    expect(elementFor('after')).toBe(first)
    expect(elements()).toHaveLength(1)
  })

  it('removes the element for a label that is gone', () => {
    const labels = [label('a', 0, 0), label('b', 100, 0)]
    const overlay = attach(labels)
    expect(elements()).toHaveLength(2)

    labels.pop()
    overlay.refresh()

    expect(elements()).toHaveLength(1)
    expect(elementFor('a')).toBeDefined()
  })

  it('removes everything from the DOM when detached', () => {
    const overlay = attach([label('a', 0, 0)])
    overlay.destroy()
    expect(elements()).toHaveLength(0)
  })
})
