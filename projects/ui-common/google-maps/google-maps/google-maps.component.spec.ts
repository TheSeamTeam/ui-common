import {
  ChangeDetectorRef,
  ElementRef,
  Injector,
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
} {
  const fileImportError$ = new Subject<TheSeamMapFileImportError>()
  const fakeGoogleMaps = {
    selection$: new Subject(),
    hover$: new Subject(),
    deleteBlocked$: new Subject(),
    editingEnabled$: new Subject(),
    contextMenuTarget$: new Subject(),
    fileImportError$,
    setBaseLatLng: () => undefined,
    setPadding: () => undefined,
  } as unknown as GoogleMapsService
  return { fakeGoogleMaps, fileImportError$ }
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
} {
  const { fakeGoogleMaps, fileImportError$ } = createFakeGoogleMaps()
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
  return { component, fileImportError$ }
}

describe('TheSeamGoogleMapsComponent', () => {
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
})
