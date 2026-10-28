import {
  ChangeDetectorRef,
  ElementRef,
  Injector,
  SimpleChange,
  SimpleChanges,
  runInInjectionContext,
} from '@angular/core'
import { FocusMonitor } from '@angular/cdk/a11y'
import { Observable, of, Subject } from 'rxjs'

import { TheSeamGoogleMapsApiLoader } from '../google-maps-api-loader/google-maps-api-loader'
import { GoogleMapsService } from '../google-maps.service'
import { MapValueManagerService } from '../map-value-manager.service'
import { TheSeamMapFileImportError } from '../map-file-import-error'
import { TheSeamGoogleMapsComponent } from './google-maps.component'

/**
 * Everything the constructor pulls off `GoogleMapsService`: five observables
 * it subscribes or feeds into a `combineLatest`, plus the two setters it
 * calls unconditionally. Nothing else — the constructor never touches the
 * rest of the service's surface, so nothing else needs a stand-in here.
 */
function createFakeGoogleMaps(): {
  fakeGoogleMaps: GoogleMapsService
  fileImportError$: Subject<TheSeamMapFileImportError>
  perPolygonCalls: boolean[]
} {
  const fileImportError$ = new Subject<TheSeamMapFileImportError>()
  const perPolygonCalls: boolean[] = []
  const fakeGoogleMaps = {
    selection$: new Subject(),
    hover$: new Subject(),
    deleteBlocked$: new Subject(),
    editingEnabled$: new Subject(),
    contextMenuTarget$: new Subject(),
    fileImportError$,
    setBaseLatLng: () => undefined,
    setPadding: () => undefined,
    setLabelPerPolygon: (value: boolean) => perPolygonCalls.push(value),
  } as unknown as GoogleMapsService
  return { fakeGoogleMaps, fileImportError$, perPolygonCalls }
}

/** A `FocusMonitor` stand-in: the constructor only ever calls `monitor()`. */
function createFakeFocusMonitor(): FocusMonitor {
  return {
    monitor: () => new Subject(),
    stopMonitoring: () => undefined,
  } as unknown as FocusMonitor
}

/** A loader whose `load()` never emits — nothing here awaits map readiness. */
function createFakeApiLoader(): TheSeamGoogleMapsApiLoader {
  return {
    load: (): Observable<void> => of(undefined),
  } as unknown as TheSeamGoogleMapsApiLoader
}

/**
 * `_changeDetectorRef = inject(ChangeDetectorRef)` is a field initializer, so
 * it needs an injection context even for a plain `new` — an ordinary
 * constructor call throws NG0203. `Injector.create` supplies just that one
 * token; this is not TestBed, and nothing here renders a component or
 * touches Angular's test harness.
 */
function createComponent(): {
  component: TheSeamGoogleMapsComponent
  fileImportError$: Subject<TheSeamMapFileImportError>
  perPolygonCalls: boolean[]
} {
  const { fakeGoogleMaps, fileImportError$, perPolygonCalls } =
    createFakeGoogleMaps()
  const fakeChangeDetectorRef = {
    markForCheck: () => undefined,
  } as unknown as ChangeDetectorRef
  const injector = Injector.create({
    providers: [
      { provide: ChangeDetectorRef, useValue: fakeChangeDetectorRef },
    ],
  })
  const component = runInInjectionContext(
    injector,
    () =>
      new TheSeamGoogleMapsComponent(
        new ElementRef(document.createElement('div')),
        createFakeFocusMonitor(),
        fakeGoogleMaps,
        new MapValueManagerService(),
        createFakeApiLoader(),
      ),
  )
  return { component, fileImportError$, perPolygonCalls }
}

/** An `ngOnChanges` payload for a single input. */
function changeFor(name: string, value: unknown): SimpleChanges {
  return { [name]: new SimpleChange(undefined, value, true) }
}

describe('TheSeamGoogleMapsComponent', () => {
  describe('labelPerPolygon', () => {
    it('defaults to one label per group', () => {
      const { component } = createComponent()
      expect(component.featureLabelPerPolygon).toBe(false)
    })

    it('pushes the value to the service when the input changes', () => {
      const { component, perPolygonCalls } = createComponent()

      component.featureLabelPerPolygon = true
      component.ngOnChanges(changeFor('featureLabelPerPolygon', true))

      expect(perPolygonCalls).toEqual([true])
    })

    it('leaves the service alone when some other input changes', () => {
      const { component, perPolygonCalls } = createComponent()

      component.ngOnChanges(changeFor('zoom', 12))

      expect(perPolygonCalls).toEqual([])
    })

    it('coerces the bare attribute form to true', () => {
      const { component } = createComponent()
      ;(
        component as unknown as { featureLabelPerPolygon: unknown }
      ).featureLabelPerPolygon = ''
      expect(component.featureLabelPerPolygon).toBe(true)
    })
  })

  describe('fileImportError', () => {
    it('emits exactly what the service reports', () => {
      const { component, fileImportError$ } = createComponent()
      const emitted: TheSeamMapFileImportError[] = []
      component.fileImportError.subscribe((value) => emitted.push(value))

      const file = new File(['nope'], 'boundaries.zip')
      const error = new Error('Shape data not found.')
      fileImportError$.next({ file, error })

      expect(emitted).toEqual([{ file, error }])
    })

    it('does not replay an earlier error to a late subscriber', () => {
      const { component, fileImportError$ } = createComponent()
      const file = new File(['nope'], 'boundaries.zip')
      fileImportError$.next({ file, error: new Error('before subscribing') })

      const emitted: TheSeamMapFileImportError[] = []
      component.fileImportError.subscribe((value) => emitted.push(value))

      expect(emitted).toEqual([])
    })
  })

  describe('placesSearchControl', () => {
    it('is off by default and placed at LEFT_TOP', () => {
      const { component } = createComponent()

      expect(component.placesSearchControlEnabled).toBe(false)
      expect(component._placesSearchControlDef.position).toBe(5)
      expect(component._placesSearchControlDef.order).toBeUndefined()
    })

    it('builds a new def when the position or order changes', () => {
      const { component } = createComponent()
      const before = component._placesSearchControlDef

      component.placesSearchControlPosition = 1 as google.maps.ControlPosition
      component.placesSearchControlOrder = 20
      component.ngOnChanges({
        ...changeFor('placesSearchControlPosition', 1),
        ...changeFor('placesSearchControlOrder', 20),
      })

      expect(component._placesSearchControlDef).not.toBe(before)
      expect(component._placesSearchControlDef.position).toBe(1)
      expect(component._placesSearchControlDef.order).toBe(20)
    })

    it('keeps the same def when some other input changes', () => {
      const { component } = createComponent()
      const before = component._placesSearchControlDef

      component.ngOnChanges(changeFor('zoom', 12))

      expect(component._placesSearchControlDef).toBe(before)
    })
  })

  describe('keyboard', () => {
    /**
     * A component whose host is in the document, with `ngOnInit` run so its
     * keydown listener is attached, and spies on the service calls the keys
     * make.
     */
    function createKeyboardComponent() {
      const { component } = createComponent()
      const host: HTMLElement = component._elementRef.nativeElement
      document.body.appendChild(host)
      const googleMaps = (component as any)._googleMaps
      googleMaps.isEditingEnabled = () => true
      googleMaps.deleteSelection = jest.fn()
      googleMaps.stopDrawing = jest.fn()
      googleMaps.openContextMenu = jest.fn()
      component.ngOnInit()
      return { component, host, googleMaps }
    }

    function pressOn(target: EventTarget, code: string): void {
      target.dispatchEvent(
        new KeyboardEvent('keydown', { code, bubbles: true }),
      )
    }

    afterEach(() => document.body.replaceChildren())

    it('deletes on Delete pressed inside the map', () => {
      const { host, googleMaps } = createKeyboardComponent()
      const mapDiv = document.createElement('div')
      host.appendChild(mapDiv)

      pressOn(mapDiv, 'Delete')

      expect(googleMaps.deleteSelection).toHaveBeenCalledTimes(1)
    })

    it('ignores Delete pressed outside the map', () => {
      const { googleMaps } = createKeyboardComponent()
      const elsewhere = document.createElement('input')
      document.body.appendChild(elsewhere)

      pressOn(elsewhere, 'Delete')
      pressOn(document.body, 'Delete')

      expect(googleMaps.deleteSelection).not.toHaveBeenCalled()
    })

    it('ignores keys typed into an input inside the map', () => {
      const { host, googleMaps } = createKeyboardComponent()
      const controlInput = document.createElement('input')
      host.appendChild(controlInput)

      pressOn(controlInput, 'Delete')
      pressOn(controlInput, 'Escape')
      pressOn(controlInput, 'ContextMenu')

      expect(googleMaps.deleteSelection).not.toHaveBeenCalled()
      expect(googleMaps.stopDrawing).not.toHaveBeenCalled()
      expect(googleMaps.openContextMenu).not.toHaveBeenCalled()
    })

    it('handles Escape and ContextMenu pressed inside the map', () => {
      const { host, googleMaps } = createKeyboardComponent()

      pressOn(host, 'Escape')
      pressOn(host, 'ContextMenu')

      expect(googleMaps.stopDrawing).toHaveBeenCalledTimes(1)
      expect(googleMaps.openContextMenu).toHaveBeenCalledTimes(1)
    })
  })
})
