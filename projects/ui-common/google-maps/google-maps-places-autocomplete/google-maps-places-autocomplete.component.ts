import { BooleanInput, coerceNumberProperty } from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { Observable, of, Subject, Subscriber } from 'rxjs'
import { startWith, switchMap } from 'rxjs/operators'

import { faSearchLocation } from '@fortawesome/free-solid-svg-icons'
import { InputBoolean } from '@theseam/ui-common/core'
import { InputDirective } from '@theseam/ui-common/form-field'
import { SeamIcon } from '@theseam/ui-common/icon'

import { SEAM_GOOGLE_PLACES_AUTOCOMPLETE_DEFAULT_OPTIONS, TheSeamGoogleMapsPlacesAutocompleteDirective } from './google-maps-places-autocomplete.directive'

declare const ngDevMode: boolean | undefined
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/**
 *
 */
@Component({
  selector: 'seam-google-maps-places-autocomplete',
  templateUrl: './google-maps-places-autocomplete.component.html',
  styleUrls: ['./google-maps-places-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamGoogleMapsPlacesAutoCompleteComponent implements OnInit, OnDestroy {
  static ngAcceptInputType_disabled: BooleanInput

  private readonly _ngUnsubscribe = new Subject<void>()
  private readonly _autoCompleteReadySubject = new Subject()

  private _placeChangedPending: { observable: Observable<any>, subscriber: Subscriber<any> }[] = []

  public autoComplete?: google.maps.places.Autocomplete

  @Input() label: string | undefined | null = 'Search by address, place or name'

  @Input() icon: SeamIcon | undefined | null = faSearchLocation

  @Input() @InputBoolean() disabled: BooleanInput = false

  @Input() placeholder: string | undefined | null = 'Enter address, place or name'

  @Input() autocorrect: 'off' | 'on' | undefined | null = 'off'

  @Input() autocapitalize: 'off' | 'on' | undefined | null = 'off'

  /**
   * Set the tab index to `-1` to allow the root element of the
   * component to receive `focus` event from javascript, but not get focused by
   * keyboard navigation.
   */
   @Input()
   set tabIndex(value: number) { this._tabIndex = coerceNumberProperty(value) }
   get tabIndex(): number { return this._tabIndex }
   private _tabIndex = -1

  @Input()
  set options(value: google.maps.places.AutocompleteOptions | undefined | null) {
    this._options = value || SEAM_GOOGLE_PLACES_AUTOCOMPLETE_DEFAULT_OPTIONS
  }
  _options: google.maps.places.AutocompleteOptions = SEAM_GOOGLE_PLACES_AUTOCOMPLETE_DEFAULT_OPTIONS

  /**
   * This event is fired when a PlaceResult is made available for a Place the
   * user has selected. If the user enters the name of a Place that was not
   * suggested by the control and presses the Enter key, or if a Place Details
   * request fails, the PlaceResult contains the user input in the name
   * property, with no other properties defined.
   *
   * See: https://developers.google.com/maps/documentation/javascript/reference/places-widget#Autocomplete.place_changed
   */
  @Output() readonly placeChanged: Observable<void>

  @ViewChild('inp', { read: InputDirective, static: true }) _inputDirective!: InputDirective

  @ViewChild(TheSeamGoogleMapsPlacesAutocompleteDirective, { static: true })
  set __autocompleteDirective(value: TheSeamGoogleMapsPlacesAutocompleteDirective) {
    this._autoCompleteDirective = value
    this.autoComplete = this._autoCompleteDirective.autoComplete
    this._placeChangedPending.forEach(pending => pending.observable.subscribe(pending.subscriber))
    this._placeChangedPending = []
  }
  _autoCompleteDirective!: TheSeamGoogleMapsPlacesAutocompleteDirective

  @HostBinding('attr.tabindex')
  get _attrTabIndex() { return this.disabled ? -1 : (this.tabIndex || 0) }

  @HostListener('click', [ 'event' ])
  _onClick(event: MouseEvent) {
    this._inputDirective.focus()
  }

  @HostListener('focus', [ '$event' ])
  _onFocus() {
    this._inputDirective?.focus()
  }

  constructor(
    private readonly _elementRef: ElementRef,
  ) {
    // this.placeChanged = this._autoCompleteDirective.placeChanged
    this.placeChanged = of()

    this.placeChanged = this._autoCompleteReadySubject.pipe(
      startWith(undefined),
      switchMap(() => this._createPlaceChangedObservable<any>())
    )

    console.log('constructor', this._autoCompleteDirective, this.autoComplete)
  }

  ngOnInit() {
    console.log('ngOnInit', this._autoCompleteDirective, this.autoComplete)
  }

  /** @ignore */
  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
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

      const sub = this._autoCompleteDirective.placeChanged.subscribe(subscriber)

      return () => sub.unsubscribe()
    })
    return observable
  }

  /** Asserts that the map has been initialized. */
  private _assertInitialized(): asserts this is WithRequired<TheSeamGoogleMapsPlacesAutoCompleteComponent, 'autoComplete'> {
    if (!this.autoComplete && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error(
        'Cannot access Google Map Places information before the API has been initialized. ' +
          'Please wait for the API to load before trying to interact with it.',
      )
    }
  }

}
