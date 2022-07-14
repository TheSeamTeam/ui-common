import { Directive, ElementRef, HostBinding, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core'
import { Observable, Subject, Subscriber } from 'rxjs'
import { startWith, switchMap } from 'rxjs/operators'

declare const ngDevMode: boolean | undefined
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export const SEAM_GOOGLE_PLACES_AUTOCOMPLETE_DEFAULT_OPTIONS: google.maps.places.AutocompleteOptions = {
  componentRestrictions: { country: 'US' }
}

@Directive({
  selector: 'input[seamGoogleMapsPlacesAutocomplete]',
  exportAs: 'seamGoogleMapsPlacesAutocomplete'
})
export class TheSeamGoogleMapsPlacesAutocompleteDirective implements OnInit, OnDestroy, OnChanges {
  private readonly _autoCompleteReadySubject = new Subject()

  private _placeChangedPending: { observable: Observable<any>, subscriber: Subscriber<any> }[] = []
  private _listeners: google.maps.MapsEventListener[] = []

  public autoComplete?: google.maps.places.Autocomplete

  @Input()
  set options(value: google.maps.places.AutocompleteOptions | undefined | null) {
    this._options = value || SEAM_GOOGLE_PLACES_AUTOCOMPLETE_DEFAULT_OPTIONS
  }
  private _options: google.maps.places.AutocompleteOptions = SEAM_GOOGLE_PLACES_AUTOCOMPLETE_DEFAULT_OPTIONS

  /**
   * This event is fired when a PlaceResult is made available for a Place the
   * user has selected. If the user enters the name of a Place that was not
   * suggested by the control and presses the Enter key, or if a Place Details
   * request fails, the PlaceResult contains the user input in the name
   * property, with no other properties defined.
   *
   * See: https://developers.google.com/maps/documentation/javascript/reference/places-widget#Autocomplete.place_changed
   */
  @Output() readonly placeChanged: Observable<any>

  @HostBinding('attr.type') _attrType = 'text'

  constructor(
    private readonly _elementRef: ElementRef<HTMLInputElement>,
    private readonly _ngZone: NgZone,
  ) {
    this.placeChanged = this._autoCompleteReadySubject.pipe(
      startWith(undefined),
      switchMap(() => this._createPlaceChangedObservable<any>())
    )
  }

  ngOnInit(): void {
    this._ngZone.runOutsideAngular(() => {
      this.autoComplete = new google.maps.places.Autocomplete(this.getHostElement(), {
        componentRestrictions: { country: 'US' }
      })

      this._placeChangedPending.forEach(pending => pending.observable.subscribe(pending.subscriber))

      this._autoCompleteReadySubject.next()
    })
  }

  ngOnDestroy(): void {
    this._listeners.forEach(l => l.remove())
    this._listeners = []
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.autoComplete && changes['options']) {
      this.autoComplete.setOptions(this._options)
    }
  }

  /**
   * Returns the bounds to which predictions are biased.
   */
  public getBounds(): google.maps.LatLngBounds | undefined {
    this._assertInitialized()
    return this.autoComplete.getBounds()
  }

  /**
   * Returns the fields to be included for the Place in the details response
   * when the details are successfully retrieved. For a list of fields see
   * [PlaceResult](https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult).
   */
  public getFields(): string[] | undefined {
    this._assertInitialized()
    return (this.autoComplete as any).getFields()
  }

  /**
   * Sets the preferred area within which to return Place results. Results are
   * biased towards, but not restricted to, this area.
   */
  public setBounds(bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral): void {
    this._assertInitialized()
    // tslint:disable-next-line: no-non-null-assertion
    return this.autoComplete.setBounds(bounds!)
  }

  /**
   * Sets the component restrictions. Component restrictions are used to
   * restrict predictions to only those within the parent component. For
   * example, the country.
   */
  public setComponentRestrictions(restrictions?: google.maps.places.ComponentRestrictions): void {
    this._assertInitialized()
    // tslint:disable-next-line: no-non-null-assertion
    return this.autoComplete.setComponentRestrictions(restrictions!)
  }

  /**
   * Sets the fields to be included for the Place in the details response when
   * the details are successfully retrieved. For a list of fields see
   * [PlaceResult](https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult).
   */
  public setFields(fields?: string[]): void {
    this._assertInitialized()
    // tslint:disable-next-line: no-non-null-assertion
    return this.autoComplete.setFields(fields!)
  }

  /** */
  public setOptions(options?: google.maps.places.AutocompleteOptions): void {
    this._assertInitialized()
    // tslint:disable-next-line: no-non-null-assertion
    return this.autoComplete.setOptions(options!)
  }

  /**
   * Sets the types of predictions to be returned. For supported types, see the
   * [developer's guide](https://developers.google.com/maps/documentation/javascript/places-autocomplete#constrain-place-types).
   * If no types are specified, all types will be returned.
   */
  public setTypes(types?: string[]): void {
    this._assertInitialized()
    // tslint:disable-next-line: no-non-null-assertion
    return this.autoComplete.setTypes(types!)
  }

  /** Focuses the input. */
  public focus(): void {
    this._elementRef.nativeElement.focus()
  }

  /** Unfocuses the input. */
  public blur(): void {
    this._elementRef.nativeElement.blur()
  }

  public getHostElement(): HTMLInputElement {
    return this._elementRef.nativeElement
  }

  private _createPlaceChangedObservable<T>(): Observable<T> {
    const observable = new Observable<T>(subscriber => {
      if (!this.autoComplete) {
        this._placeChangedPending.push({ observable, subscriber })
        return undefined
      }

      const listener = this.autoComplete.addListener('place_changed', (event: T) => {
        this._ngZone.run(() => subscriber.next(event))
      })
      this._listeners.push(listener)

      return () => listener.remove()
    })
    return observable
  }

  /** Asserts that the map has been initialized. */
  private _assertInitialized(): asserts this is WithRequired<TheSeamGoogleMapsPlacesAutocompleteDirective, 'autoComplete'> {
    if (!this.autoComplete && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error(
        'Cannot access Google Map Places information before the API has been initialized. ' +
          'Please wait for the API to load before trying to interact with it.',
      )
    }
  }
}
    // this.autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement, {
    //   componentRestrictions: { country: 'US' }
    // })

    // this.autocomplete.addListener('place_changed', () => {
    //   if (typeof this.value === 'string' && this.value.length > 0) {
    //     return
    //   }

    //   this._ngZone.run( () => {
    //     const place = this.autocomplete.getPlace()
    //     if  (place.geometry !== undefined || place.geometry != null) {
    //       this.map.fitBounds(place.geometry.viewport)
    //     }
    //   })
    // })
