import { DOCUMENT } from '@angular/common'
import { Directive, DoCheck, ElementRef, Host, HostBinding, Inject, Input, NgZone, OnDestroy, OnInit, Optional, Self } from '@angular/core'
import { fromEvent, merge, Subject } from 'rxjs'
import { auditTime, last, switchMap, takeUntil, tap } from 'rxjs/operators'

import { AssetLoaderService, LoadedAssetRef } from '@theseam/ui-common/services'
import { getAttribute, hasAttribute, notNullOrUndefined, toggleAttribute } from '@theseam/ui-common/utils'

import { NgControl } from '@angular/forms'
import { IntlTelInputFn, intlTelInputUtils } from './intl-tel-input'
import type { IntlTelInput } from './intl-tel-input'
import { TEL_INPUT_STYLES, TEL_INPUT_STYLESHEET_PATH, TEL_INPUT_UTILS_PATH } from './tel-input-constants'
import { globalIntlTelInputUtils } from './utils/index'

@Directive({
  selector: 'input[seamTelInput]',
  exportAs: 'seamTelInput'
})
export class TheSeamTelInputDirective implements OnInit, OnDestroy, DoCheck {
  private readonly _ngUnsubscribe = new Subject<void>()

  private _instance: IntlTelInput.Plugin | undefined
  private _loadedAssetRefs: LoadedAssetRef<HTMLLinkElement | HTMLStyleElement>[] = []

  @HostBinding('attr.type') _attrType = 'tel'

  @Input()
  set value(v: string | undefined | null) {
    // console.log('set value', v, this._instance)
    this._value = v
    if (this._instance) {
      this._instance.setNumber(notNullOrUndefined(v) ? v : '')
      this.updateValue()
    }
  }
  get value(): string | undefined | null {
    if (this._instance) {
      return this._instance?.getNumber()
    }
    return this._value
  }
  private _value: string | undefined | null

  constructor(
    private readonly _elementRef: ElementRef<HTMLInputElement>,
    private readonly _assetLoader: AssetLoaderService,
    private readonly _ngZone: NgZone,
    @Optional() @Inject(DOCUMENT) private readonly _document?: any,
    @Optional() @Self() private readonly _ngControl?: NgControl,
  ) { }

  ngOnInit(): void {
    console.log('_ngControl', this._ngControl, this._ngControl?.value)
    console.log('IntlTelInputFn', IntlTelInputFn, this._elementRef.nativeElement, this._elementRef.nativeElement?.value, this.value)
    // this._elementRef.nativeElement.value = this.value ?? ''
    merge(
      this._assetLoader.loadStyleSheet(TEL_INPUT_STYLESHEET_PATH),
      this._assetLoader.loadStyle(TEL_INPUT_STYLES)
    ).pipe(
      // tap(v => console.log('loaded', v)),
      tap(v => this._loadedAssetRefs.push(v)),
      last(),
      // tap(v => console.log('StyleLoadingDone', v)),
      switchMap(() => {
        console.log('IntlTelInputFn2', IntlTelInputFn, this._elementRef.nativeElement, this.value)
        this._instance = IntlTelInputFn(this._elementRef.nativeElement, {
          utilsScript: TEL_INPUT_UTILS_PATH,
          preferredCountries: [ 'US' ],
          nationalMode: false,
          formatOnDisplay: true,
          autoPlaceholder: 'off',
          separateDialCode: false,
          autoHideDialCode: false,
          // TODO: Add initialCountry support.
          // initialCountry: 'auto'
        })

        this._tryUpdateDropdownAttributes()

        return this._instance.promise
      }),
      tap(() => console.log('%c_instance ready', 'color:green', this._instance, this._elementRef.nativeElement.value)),
      tap(() => this._initDropdownListener()),
      tap(() => this.value = this._value),
      tap(this._formatIntlTelInput),
      switchMap(() => merge(
        fromEvent(this._elementRef.nativeElement, 'keyup'),
        fromEvent(this._elementRef.nativeElement, 'change')
      )),
      tap(this._formatIntlTelInput),
      takeUntil(this._ngUnsubscribe)
    ).subscribe()
  }

  ngOnDestroy(): void {
    this._instance?.destroy()
    for (const ref of this._loadedAssetRefs) {
      ref.destroy()
    }

    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  ngDoCheck() {
    this._tryUpdateDropdownAttributes()
  }

  private _tryUpdateDropdownAttributes() {
    const control = this._ngControl
    if (control) {
      const flagsContainer: HTMLElement | null | undefined = (this._instance as any)?.selectedFlag
      if (flagsContainer) {
        toggleAttribute(flagsContainer, 'aria-disabled', control.disabled ?? false)

        const disabled = control.disabled ?? false
        if (!disabled) {
          if (getAttribute(flagsContainer, 'tabindex') !== '0') {
            flagsContainer.setAttribute('tabindex', '0')
          }
        } else {
          if (hasAttribute(flagsContainer, 'tabindex')) {
            flagsContainer.removeAttribute('tabindex')
          }
        }
      }
    }
  }

  private _formatIntlTelInput = () => {
    // if (typeof intlTelInputUtils !== 'undefined') {
    //   const currentText = this._instance?.getNumber(intlTelInputUtils.numberFormat.INTERNATIONAL)
    //   console.log('currentText', currentText, this._instance?.getSelectedCountryData())
    //   console.log(this._instance?.getValidationError())
    //   if (typeof currentText === 'string') {
    //     this._instance?.setNumber(currentText)
    //   }
    // }

    this.updateValue()
  }

  public updateValue(): void {
    // console.log('%cupdateValue START', 'color:cyan', typeof intlTelInputUtils !== 'undefined')
    if (typeof globalIntlTelInputUtils() !== 'undefined') {
      const currentText = this._instance?.getNumber(intlTelInputUtils.numberFormat.E164)
      // console.log('currentText', currentText, this._instance?.getSelectedCountryData())
      // console.log('fullNumber', (this._instance as any)._getFullNumber())
      // console.log('E164', this._instance?.getNumber(intlTelInputUtils.numberFormat.E164))
      // console.log('INTERNATIONAL', this._instance?.getNumber(intlTelInputUtils.numberFormat.INTERNATIONAL))
      // console.log('NATIONAL', this._instance?.getNumber(intlTelInputUtils.numberFormat.NATIONAL))
      // console.log('RFC3966', this._instance?.getNumber(intlTelInputUtils.numberFormat.RFC3966))
      // console.log('getValidationError', this._instance?.getValidationError())
      if (typeof currentText === 'string') {
        this._instance?.setNumber(currentText)
      }
    }
    // console.log('%cupdateValue END', 'color:cyan')
  }

  public getFullNumber(): string | undefined | null {
    if (typeof globalIntlTelInputUtils() !== 'undefined' && this._instance) {
      // return (this._instance as any)._getFullNumber()
      return this._instance.getNumber(intlTelInputUtils.numberFormat.E164)
    }
    return this.value
  }

  private _initDropdownListener() {
    const doc = this._document
    if (!doc) {
        return
    }

    this._ngZone.runOutsideAngular(() => {
      const openDropdown$ = fromEvent(this._elementRef.nativeElement, 'open:countrydropdown')
      const closeDropdown$ = fromEvent(this._elementRef.nativeElement, 'close:countrydropdown')
      const instance = this._instance as any
      openDropdown$.pipe(
        switchMap(() => {
          const pressDown$ = merge(
            fromEvent(doc, 'touchstart', { capture: true }),
            fromEvent(doc, 'mousedown', { capture: true })
          ).pipe(
            auditTime(0),
            tap((event: any) => {
              if (instance.countryList.contains(event.target) || instance.selectedFlag.contains(event.target)) {
                return
              }
              instance._closeDropdown()
            })
          )

          const flagBtnClick$ = fromEvent<MouseEvent>(instance.selectedFlag, 'click').pipe(
            tap((event: MouseEvent) => {
              if (!this.isDropdownVisible()) {
                return
              }

              event.preventDefault()
              instance._closeDropdown()
            })
          )

          return merge(pressDown$, flagBtnClick$).pipe(takeUntil(closeDropdown$))
        }),
        takeUntil(this._ngUnsubscribe)
      ).subscribe()

      const flagsContainer: HTMLElement | null | undefined = (this._instance as any)?.selectedFlag
      if (flagsContainer) {
        fromEvent(flagsContainer, 'keydown', { capture: true }).pipe(
          tap((e: any) => {
            const control = this._ngControl
            if (control) {
              const disabled = control.disabled ?? false
              if (disabled && ['ArrowUp', 'Up', 'ArrowDown', 'Down', ' ', 'Enter'].indexOf(e.key) !== -1) {
                // prevent form from being submitted if "ENTER" was pressed
                e.preventDefault()
                // prevent event from being handled again by document
                e.stopPropagation()
              }
            }
          }),
          takeUntil(this._ngUnsubscribe)
        ).subscribe()
      }
    })
  }

  public isDropdownVisible() {
    if (!this._instance) {
      return false
    }

    const instance = this._instance as any
    return !instance.countryList.classList.contains('iti__hide')
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
}
