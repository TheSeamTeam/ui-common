/**
 * A minimal stand-in for the parts of the Google Maps JS API this module uses.
 *
 * The real API is loaded from a script tag and is unavailable under Jest. This
 * models only the geometry, feature, and data-layer surface the module touches,
 * which is enough to test every decision the module makes. It renders nothing.
 */

class FakeLatLng {
  constructor(
    private readonly _lat: number,
    private readonly _lng: number,
  ) {}
  lat(): number {
    return this._lat
  }
  lng(): number {
    return this._lng
  }
}

class FakeLatLngBounds {
  private _minLat = Number.POSITIVE_INFINITY
  private _maxLat = Number.NEGATIVE_INFINITY
  private _minLng = Number.POSITIVE_INFINITY
  private _maxLng = Number.NEGATIVE_INFINITY

  extend(latLng: FakeLatLng): FakeLatLngBounds {
    this._minLat = Math.min(this._minLat, latLng.lat())
    this._maxLat = Math.max(this._maxLat, latLng.lat())
    this._minLng = Math.min(this._minLng, latLng.lng())
    this._maxLng = Math.max(this._maxLng, latLng.lng())
    return this
  }
  isEmpty(): boolean {
    return this._minLat > this._maxLat
  }
  getCenter(): FakeLatLng {
    return new FakeLatLng(
      (this._minLat + this._maxLat) / 2,
      (this._minLng + this._maxLng) / 2,
    )
  }
  getNorthEast(): FakeLatLng {
    return new FakeLatLng(this._maxLat, this._maxLng)
  }
  getSouthWest(): FakeLatLng {
    return new FakeLatLng(this._minLat, this._minLng)
  }
}

const toLatLng = (value: any): FakeLatLng =>
  value instanceof FakeLatLng ? value : new FakeLatLng(value.lat, value.lng)

class FakeLinearRing {
  private readonly _points: FakeLatLng[]
  constructor(points: any[]) {
    this._points = points.map(toLatLng)
  }
  getArray(): FakeLatLng[] {
    return [...this._points]
  }
  getLength(): number {
    return this._points.length
  }
  forEachLatLng(cb: (latLng: FakeLatLng) => void): void {
    this._points.forEach(cb)
  }
}

class FakeDataPolygon {
  private readonly _rings: FakeLinearRing[]
  constructor(rings: any[]) {
    this._rings = rings.map((r) =>
      r instanceof FakeLinearRing ? r : new FakeLinearRing(r),
    )
  }
  getType(): string {
    return 'Polygon'
  }
  getArray(): FakeLinearRing[] {
    return [...this._rings]
  }
  forEachLatLng(cb: (latLng: FakeLatLng) => void): void {
    this._rings.forEach((r) => r.forEachLatLng(cb))
  }
}

class FakeDataMultiPolygon {
  private readonly _polygons: FakeDataPolygon[]
  constructor(polygons: any[]) {
    this._polygons = polygons.map((p) =>
      p instanceof FakeDataPolygon ? p : new FakeDataPolygon(p),
    )
  }
  getType(): string {
    return 'MultiPolygon'
  }
  getArray(): FakeDataPolygon[] {
    return [...this._polygons]
  }
  forEachLatLng(cb: (latLng: FakeLatLng) => void): void {
    this._polygons.forEach((p) => p.forEachLatLng(cb))
  }
}

let featureSeq = 0

class FakeDataFeature {
  private _geometry: any
  private readonly _properties = new Map<string, any>()
  private readonly _id: string | number

  /**
   * The layer this feature was added to, or null. The real API raises
   * `setproperty` / `removeproperty` / `setgeometry` on the Data layer a
   * feature belongs to, and `GoogleMapsService` hangs its value-change and
   * label-refresh pipeline off exactly those events. Set by `FakeData.add`
   * and cleared by `FakeData.remove`.
   */
  _owner: FakeData | null = null

  constructor(options?: {
    geometry?: any
    id?: string | number
    properties?: Record<string, any>
  }) {
    this._geometry = options?.geometry ?? null
    this._id = options?.id ?? `fake-feature-${featureSeq++}`
    Object.entries(options?.properties ?? {}).forEach(([k, v]) =>
      this._properties.set(k, v),
    )
  }

  getId(): string | number {
    return this._id
  }
  getGeometry(): any {
    return this._geometry
  }
  setGeometry(geometry: any): void {
    const oldGeometry = this._geometry
    this._geometry = geometry
    this._owner?.emit('setgeometry', {
      feature: this,
      newGeometry: geometry,
      oldGeometry,
    })
  }
  getProperty(name: string): any {
    return this._properties.get(name)
  }
  setProperty(name: string, value: any): void {
    const oldValue = this._properties.get(name)
    this._properties.set(name, value)
    this._owner?.emit('setproperty', { feature: this, name, oldValue })
  }
  removeProperty(name: string): void {
    const oldValue = this._properties.get(name)
    this._properties.delete(name)
    this._owner?.emit('removeproperty', { feature: this, name, oldValue })
  }
  forEachProperty(cb: (value: any, name: string) => void): void {
    this._properties.forEach(cb)
  }
  toGeoJson(cb: (json: any) => void): void {
    cb({ type: 'Feature', id: this._id, properties: {}, geometry: null })
  }
}

/** Listener registry shared by the fake Data layer, so specs can fire events. */
export class FakeMapsEventTarget {
  private readonly _listeners = new Map<string, ((event: any) => void)[]>()

  addListener(name: string, handler: (event: any) => void) {
    const list = this._listeners.get(name) ?? []
    list.push(handler)
    this._listeners.set(name, list)
    return {
      remove: () => {
        const current = this._listeners.get(name) ?? []
        this._listeners.set(
          name,
          current.filter((h) => h !== handler),
        )
      },
    }
  }

  /** Fire every handler registered for `name`. Used by specs. */
  emit(name: string, event?: any): void {
    ;(this._listeners.get(name) ?? []).forEach((h) => h(event))
  }
}

export class FakeData extends FakeMapsEventTarget {
  private readonly _features: FakeDataFeature[] = []
  private _styleFn: any = null
  readonly overrides = new Map<FakeDataFeature, any>()

  add(feature: any): any {
    const f =
      feature instanceof FakeDataFeature
        ? feature
        : new FakeDataFeature(feature)
    f._owner = this
    this._features.push(f)
    this.emit('addfeature', { feature: f })
    return f
  }
  remove(feature: any): void {
    const index = this._features.indexOf(feature)
    if (index !== -1) {
      this._features.splice(index, 1)
      feature._owner = null
      this.emit('removefeature', { feature })
    }
  }
  forEach(cb: (feature: any) => void): void {
    ;[...this._features].forEach(cb)
  }
  setStyle(style: any): void {
    this._styleFn = style
  }
  /** Evaluate the registered style callback for a feature. Used by specs. */
  styleFor(feature: any): any {
    return typeof this._styleFn === 'function'
      ? this._styleFn(feature)
      : this._styleFn
  }
  overrideStyle(feature: any, style: any): void {
    this.overrides.set(feature, style)
  }
  revertStyle(feature?: any): void {
    if (feature) {
      this.overrides.delete(feature)
    } else {
      this.overrides.clear()
    }
  }
  addGeoJson(): any[] {
    throw new Error(
      'FakeData.addGeoJson is not implemented. Build features with ' +
        'dataPolygonFromGeoJson / new google.maps.Data.Feature instead.',
    )
  }
  toGeoJson(cb: (json: any) => void): void {
    cb({ type: 'FeatureCollection', features: [] })
  }
}

/**
 * A stand-in for `google.maps.Map`, enough to construct `GoogleMapsService`.
 *
 * `setMap()` defers Terra Draw initialisation to the map's first `idle`, and
 * this fake never fires `idle` unless a spec asks for it — so a spec can
 * exercise the service without Terra Draw at all.
 *
 * Viewport calls are recorded rather than simulated: a spec asserts on
 * `bounds` / `padding` / `center` instead of on a rendered map.
 */
export class FakeMap extends FakeMapsEventTarget {
  readonly data = new FakeData()
  /** One array per google.maps.ControlPosition slot. */
  readonly controls: any[][] = Array.from({ length: 13 }, () => [])

  bounds: any = null
  padding: any = undefined
  center: any = null

  private readonly _div = document.createElement('div')
  private _zoom = 14

  getDiv(): HTMLDivElement {
    return this._div
  }
  getZoom(): number {
    return this._zoom
  }
  setZoom(zoom: number): void {
    this._zoom = zoom
  }
  fitBounds(bounds: any, padding?: any): void {
    this.bounds = bounds
    this.padding = padding
  }
  panTo(latLng: any): void {
    this.center = latLng
  }
  panToBounds(bounds: any): void {
    this.bounds = bounds
  }
}

const FAKE_GOOGLE = {
  maps: {
    LatLng: FakeLatLng,
    LatLngBounds: FakeLatLngBounds,
    Map: FakeMap,
    Data: Object.assign(FakeData, {
      Feature: FakeDataFeature,
      Polygon: FakeDataPolygon,
      MultiPolygon: FakeDataMultiPolygon,
      LinearRing: FakeLinearRing,
    }),
    event: {
      removeListener: (listener: any) => listener?.remove?.(),
      addListenerOnce: (
        target: any,
        name: string,
        handler: (event: any) => void,
      ) => target.addListener(name, handler),
      trigger: (target: any, name: string, event?: any) =>
        target.emit?.(name, event),
    },
    ControlPosition: { TOP_LEFT: 1, LEFT_BOTTOM: 6, RIGHT_BOTTOM: 9 },
  },
}

/** Install the fake on `globalThis.google`. Call in `beforeEach`. */
export function installFakeGoogleMaps(): void {
  featureSeq = 0
  ;(globalThis as any).google = FAKE_GOOGLE
}

/** Remove the fake. Call in `afterEach` so suites cannot leak into each other. */
export function uninstallFakeGoogleMaps(): void {
  delete (globalThis as any).google
}
