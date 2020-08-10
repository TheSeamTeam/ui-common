import { Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core'
import { from, fromEvent, merge, Subject } from 'rxjs'
import { last, switchMap, takeUntil, tap } from 'rxjs/operators'

import intlTelInput from 'intl-tel-input'

import { AssetLoaderService, LoadedAssetRef } from '../services/index'
import { notNullOrUndefined } from '../utils/index'
import { TEL_INPUT_STYLES, TEL_INPUT_STYLESHEET_PATH, TEL_INPUT_UTILS_PATH } from './tel-input-constants'

@Directive({
  selector: 'input[seamTelInput]',
  exportAs: 'seamTelInput'
})
export class TheSeamTelInputDirective implements OnInit, OnDestroy {
  private readonly _ngUnsubscribe = new Subject()

  private _instance: intlTelInput.Plugin | undefined
  private _loadedAssetRefs: LoadedAssetRef<HTMLLinkElement |  HTMLStyleElement>[] = []

  @HostBinding('attr.type') _attrType = 'tel'

  @Input()
  set value(v: string) {
    // console.log('set value', v, this._instance)
    this._value = v
    if (this._instance) {
      this._instance.setNumber(notNullOrUndefined(v) ? v : '')
      this.updateValue()
    }
  }
  get value(): string {
    if (this._instance) {
      return this._instance?.getNumber()
    }
    return this._value
  }
  private _value: string

  constructor(
    private readonly _elementRef: ElementRef<HTMLInputElement>,
    private readonly _assetLoader: AssetLoaderService
  ) {
    // console.log('TheSeamTelInputDirective', this._elementRef)
  }

  ngOnInit(): void {
    merge(
      this._assetLoader.loadStyleSheet(TEL_INPUT_STYLESHEET_PATH),
      this._assetLoader.loadStyle(TEL_INPUT_STYLES)
    ).pipe(
      // tap(v => console.log('loaded', v)),
      tap(v => this._loadedAssetRefs.push(v)),
      last(),
      // tap(v => console.log('StyleLoadingDone', v)),
      switchMap(() => {
        this._instance = intlTelInput(this._elementRef.nativeElement, {
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

        return this._instance.promise
      }),
      // tap(() => console.log('%c_instance ready', 'color:green', this._instance, this._elementRef.nativeElement.value)),
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

    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  private _formatIntlTelInput = (e) => {
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
    if (typeof intlTelInputUtils !== 'undefined') {
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

  public getFullNumber(): string {
    if (typeof intlTelInputUtils !== 'undefined' && this._instance) {
      // return (this._instance as any)._getFullNumber()
      return this._instance.getNumber(intlTelInputUtils.numberFormat.E164)
    }
    return this.value
  }

}
