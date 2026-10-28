import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core'

import { faSearchLocation } from '@fortawesome/free-solid-svg-icons'
import { SeamIcon } from '@theseam/ui-common/icon'

import { TheSeamGoogleMapsPlacesAutoCompleteComponent } from '../google-maps-places-autocomplete/google-maps-places-autocomplete.component'
import { SEAM_GOOGLE_PLACES_AUTOCOMPLETE_DEFAULT_OPTIONS } from '../google-maps-places-autocomplete/google-maps-places-autocomplete.directive'
import { GoogleMapsService } from '../google-maps.service'
import { MAP_CONTROL_DATA } from '../map-controls-service'

export interface GoogleMapsPlacesSearchControlData {
  label?: string | undefined | null
  icon?: SeamIcon | undefined | null
  placeholder?: string | undefined | null
}

let nextId = 0

/**
 * A map control that keeps a places search out of the way until it is asked
 * for: a button that opens the input beside it. Choosing a place fits the map
 * to that place's viewport and closes the input again.
 */
@Component({
  selector: 'seam-google-maps-places-search-control',
  templateUrl: './google-maps-places-search-control.component.html',
  styleUrls: ['./google-maps-places-search-control.component.scss'],
  host: {
    class: 'gmnoprint',
    '[class.places-search-control--open]': '_open()',
    '(keydown)': '_onKeydown($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TheSeamGoogleMapsPlacesSearchControlComponent
  implements OnDestroy
{
  private readonly _googleMaps = inject(GoogleMapsService)
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef)
  private readonly _ngZone = inject(NgZone)
  private readonly _changeDetectorRef = inject(ChangeDetectorRef)
  private readonly _data = inject<GoogleMapsPlacesSearchControlData>(
    MAP_CONTROL_DATA,
    { optional: true },
  )

  private _removeOutsidePointerListener: (() => void) | undefined

  readonly label: string = this._data?.label ?? 'Search for a place'
  readonly icon: SeamIcon = this._data?.icon ?? faSearchLocation
  readonly placeholder: string =
    this._data?.placeholder ?? 'Enter address, place or name'

  readonly _panelId = `seam-google-maps-places-search-control-${nextId++}`

  /**
   * Only the viewport is read, so only it is asked for. The default options
   * ask for the same field; it is set here too so the control keeps working
   * if that default changes.
   */
  readonly _autocompleteOptions: google.maps.places.AutocompleteOptions = {
    ...SEAM_GOOGLE_PLACES_AUTOCOMPLETE_DEFAULT_OPTIONS,
    fields: ['geometry.viewport'],
  }

  protected readonly _open = signal(false)

  @ViewChild(TheSeamGoogleMapsPlacesAutoCompleteComponent, { static: true })
  _autocomplete!: TheSeamGoogleMapsPlacesAutoCompleteComponent

  @ViewChild('toggleButton', { static: true })
  _toggleButton!: ElementRef<HTMLButtonElement>

  /** @ignore */
  ngOnDestroy(): void {
    this._stopListeningForOutsidePointer()
  }

  isOpen(): boolean {
    return this._open()
  }

  toggle(): void {
    if (this._open()) {
      this.close(true)
    } else {
      this.open()
    }
  }

  /** Shows the input and moves focus into it. */
  open(): void {
    if (this._open()) {
      return
    }
    this._open.set(true)
    // The input is hidden until this view next renders, and a hidden input
    // cannot take focus, so render now rather than wait for the next pass.
    this._changeDetectorRef.detectChanges()
    this._autocomplete.focus()
    this._listenForOutsidePointer()
  }

  /**
   * Hides the input. Its text is kept, so reopening shows the last search.
   *
   * @param restoreFocus Move focus back to the button. Off for a click
   * elsewhere, which has already put focus where the user wanted it.
   */
  close(restoreFocus: boolean): void {
    if (!this._open()) {
      return
    }
    this._stopListeningForOutsidePointer()
    this._open.set(false)
    this._changeDetectorRef.markForCheck()
    if (restoreFocus) {
      this._toggleButton.nativeElement.focus()
    }
  }

  _onPlaceChanged(): void {
    // A place typed without picking a suggestion comes back with only a name.
    const viewport = this._autocomplete.getPlace()?.geometry?.viewport
    if (viewport === undefined || viewport === null) {
      return
    }
    this._googleMaps.fitBounds(viewport)
    this.close(true)
  }

  _onKeydown(event: KeyboardEvent): void {
    if (!this._open()) {
      return
    }
    // The map handles Delete, Escape and ContextMenu on `window`, so a key
    // pressed while typing here would otherwise also act on the map — Delete
    // would delete the selected feature.
    event.stopPropagation()
    if (event.key === 'Escape') {
      event.preventDefault()
      this.close(true)
    }
  }

  private _listenForOutsidePointer(): void {
    this._stopListeningForOutsidePointer()
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (
        target === null ||
        this._elementRef.nativeElement.contains(target) ||
        // Google renders the suggestion list in a `.pac-container` on `body`.
        target.closest?.('.pac-container')
      ) {
        return
      }
      this._ngZone.run(() => this.close(false))
    }
    this._ngZone.runOutsideAngular(() =>
      document.addEventListener('pointerdown', onPointerDown, true),
    )
    this._removeOutsidePointerListener = () =>
      document.removeEventListener('pointerdown', onPointerDown, true)
  }

  private _stopListeningForOutsidePointer(): void {
    this._removeOutsidePointerListener?.()
    this._removeOutsidePointerListener = undefined
  }
}
