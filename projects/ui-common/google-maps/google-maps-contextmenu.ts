import { ESCAPE } from '@angular/cdk/keycodes'
import { NgZone, ViewContainerRef } from '@angular/core'
import { fromEvent, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { MenuComponent } from '@theseam/ui-common/menu'

import { isFeatureSelected } from './google-maps-feature-helpers'

// TODO: Close on map losing focus.

export class GoogleMapsContextMenu {

  private readonly _overlayView: google.maps.OverlayView
  private readonly _cleanupFn: () => void

  constructor(
    private readonly _map: google.maps.Map,
    private readonly _menu: MenuComponent,
    _position: google.maps.LatLng,
    private readonly _vcr: ViewContainerRef,
    private readonly _ngZone: NgZone,
    private readonly _data: google.maps.Data,
    private readonly _feature: google.maps.Data.Feature,
  ) {
    const tplRef = this._menu.templateRef
    if (tplRef === undefined || tplRef === null) {
      throw Error(`Menu template is not defined.`)
    }

    const ref = this._vcr.createEmbeddedView(tplRef)
    ref.detectChanges()

    const listeners: google.maps.MapsEventListener[] = []
    const ngUnsubscribe = new Subject<void>()

    // TODO: Fix the initial focus. setTimeout avoids the wrong contextmenu
    // getting triggered, but the first item flashes and looks off this way.
    setTimeout(() => {
      this._menu.focusFirstItem('program')
    })
    this._menu.closed.pipe(
      takeUntil(ngUnsubscribe)
    ).subscribe(v => {
      this.close()
    })

    fromEvent(document, 'keydown').pipe(
      takeUntil(ngUnsubscribe)
    ).subscribe((event: any) => {
      if (event.keyCode === ESCAPE) {
        this.close()
      }
    })

    const __cleanup = () => this._cleanupFn()
    class GoogleMapsContextMenuOverlayView extends google.maps.OverlayView {
      public containerDiv: HTMLDivElement

      constructor(
        public position: google.maps.LatLng,
        content: HTMLElement
      ) {
        super()
        this.position = position

        this.containerDiv = document.createElement('div')
        this.containerDiv.style.cursor = 'auto'
        this.containerDiv.style.height = '0',
        this.containerDiv.style.position = 'absolute'
        this.containerDiv.appendChild(content)

        // Optionally stop clicks, etc., from bubbling up to the map.
        GoogleMapsContextMenuOverlayView.preventMapHitsAndGesturesFrom(this.containerDiv)
      }

      /** Called when the view is added to the map. */
      onAdd() {
        // tslint:disable-next-line: no-non-null-assertion
        this.getPanes()!.floatPane.appendChild(this.containerDiv)
      }

      /** Called when the view is removed from the map. */
      onRemove() {
        if (this.containerDiv.parentElement) {
          this.containerDiv.parentElement.removeChild(this.containerDiv)
        }
        __cleanup()
      }

      /** Called each frame when the view needs to draw itself. */
      draw() {
        // tslint:disable-next-line: no-non-null-assertion
        const divPosition = this.getProjection().fromLatLngToDivPixel(this.position)!

        // Hide the popup when it is far out of view.
        const display =
          Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
            ? 'block'
            : 'none'

        if (display === 'block') {
          this.containerDiv.style.left = divPosition.x + 'px'
          this.containerDiv.style.top = divPosition.y + 'px'
        }

        if (this.containerDiv.style.display !== display) {
          this.containerDiv.style.display = display
        }
      }
    }

    this._overlayView = new GoogleMapsContextMenuOverlayView(_position, ref.rootNodes[0])
    this._overlayView.setMap(this._map)

    this._ngZone.runOutsideAngular(() => {
      listeners.push(this._data.addListener('removefeature', (event: google.maps.Data.RemoveFeatureEvent) => {
        if (event.feature === this._feature) {
          this._ngZone.run(() => { this.close() })
        }
      }))

      listeners.push(this._data.addListener('setproperty', (event: google.maps.Data.SetPropertyEvent) => {
        if (event.feature === this._feature && !isFeatureSelected(this._feature)) {
          this._ngZone.run(() => { this.close() })
        }
      }))

      listeners.push(this._data.addListener('removeproperty', (event: google.maps.Data.RemovePropertyEvent) => {
        if (event.feature === this._feature && !isFeatureSelected(this._feature)) {
          this._ngZone.run(() => { this.close() })
        }
      }))

      listeners.push(this._map.addListener('click', (event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
        this._ngZone.run(() => { this.close() })
      }))

      listeners.push(this._data.addListener('click', (event: google.maps.Data.MouseEvent) => {
        this._ngZone.run(() => { this.close() })
      }))
    })

    this._cleanupFn = () => {
      ngUnsubscribe.next()
      ngUnsubscribe.complete()
      listeners.forEach(google.maps.event.removeListener)
    }
  }

  public close(): void {
    this._overlayView.setMap(null)
  }

}
