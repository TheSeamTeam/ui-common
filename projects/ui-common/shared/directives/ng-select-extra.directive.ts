import {
  AfterViewChecked,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core'
import { NgControl } from '@angular/forms'
import { Subject, Subscription } from 'rxjs'
import { filter, takeUntil } from 'rxjs/operators'

import { NgOption, NgSelectComponent } from '@ng-select/ng-select'
import { ResizeSensor } from 'css-element-queries'

import { TheSeamElementResizedEvent } from './elem-resized.directive'

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ng-select',
  exportAs: 'seamNgSelectExtra',
})
export class TheSeamNgSelectExtraDirective implements OnInit, AfterViewChecked, OnDestroy {

  private readonly _elementRef = inject(ElementRef<HTMLElement>)
  private readonly _ngZone = inject(NgZone)
  private readonly _ngSelect = inject(NgSelectComponent)
  private readonly _ngControl = inject<NgControl | null>(NgControl, { optional: true, self: true })

  private readonly _ngUnsubscribe = new Subject<void>()

  private _markedItem: NgOption | null = null
  private _checkMarked = false
  private _keyPressWorkaroundSub: Subscription | null = null

  private _resizedEvent = new EventEmitter<TheSeamElementResizedEvent>()
  private _resizeSensor?: ResizeSensor

  /**
   * Set the tab index to `-1` to allow the root element of the ng-select
   * component to receive `focus` event from javascript, but not get focused by
   * keyboard navigation.
   */
  @HostBinding('attr.tabIndex')
  get _tabIndex() { return this._ngSelect.disabled ? undefined : -1 }

  /**
   * Listening for focus event on root of component to allow javascript
   * `focus()` function to trigger the components focus.
   */
  @HostListener('focus', ['$event']) onFocus($event: FocusEvent) {
    const target = $event.target as HTMLElement
    if (target === this._elementRef.nativeElement && !this._ngSelect.disabled) {
      this._ngSelect.focus()
    }

    // ng-select has an input `labelForId` that sets the autocomplete attribute
    // in ngOnInit. I am not positive that it is wrong by doing that, but this
    // hack makes it set the attributes again on focus, because that gives the
    // result I was expecting, since we don't manually set the `labelForId`
    // input.
    const _ngSelect = this._ngSelect as any
    _ngSelect._setInputAttributes()
  }

  @HostBinding('class.is-invalid') get _isInvalid() {
    return this._ngControl ? this._ngControl.invalid && (this._ngControl.dirty || this._ngControl.touched) : false
  }

  @HostBinding('class.ng-empty-string-value') get _isEmptyStringValue() {
    return this._ngControl ? this._ngControl.value === '' : false
  }

  ngOnInit() {
    this._ngSelect.focusEvent
      .subscribe(v => this._enableKeyPressWorkaround())

    this._ngSelect.blurEvent
      .subscribe(v => this._disableKeyPressWorkaround())

    window.addEventListener('scroll', this._onScroll, true)

    // When the input is allowed to change its height the position doesn't update itself.
    // this._resizedEvent.pipe(
    //   auditTime(30)
    // ).subscribe(event => {
    //   if (this._elementRef && this._elementRef.nativeElement) {
    //     if (this._elementRef.nativeElement.classList.contains('ng-select-value-grow-h')) {
    //       if (this._ngSelect.isOpen && this._ngSelect.dropdownPanel) {
    //         this._ngSelect.dropdownPanel.updateDropdownPosition()
    //       }
    //     } else {
    //       this._elementRef.nativeElement.classList.remove('ng-select-value-grow-h')
    //     }
    //   }
    // })

    // this._patch_ngSelect_open()
  }

  ngOnDestroy() {
    this._resizeSensor?.detach()

    window.removeEventListener('scroll', this._onScroll, true)

    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  ngAfterViewChecked() {
    if (this._ngSelect.dropdownPanel) {
      if (this._checkMarked) {
        if (this._ngSelect.dropdownPanel && this._markedItem !== null) {
          if (this._markedItem.index !== this._ngSelect.dropdownPanel.markedItem.index) {
            this._ngSelect.dropdownPanel.scrollTo(this._ngSelect.dropdownPanel.markedItem)
          }
        }
      }
    }
    this._checkMarked = false

    this._resizeSensor = new ResizeSensor(this._elementRef.nativeElement, event => {
      this._resizedEvent.emit({ element: this._elementRef.nativeElement, size: event })
    })
  }

  private _onScroll = (event: any) => {
    if (this._ngSelect && this._ngSelect.isOpen) {
      const isScrollingInScrollHost = (event.target.className as string).indexOf('ng-dropdown-panel-items') !== -1
      const isInSensor = (event.target.className as string).indexOf('resize-sensor-shrink') !== -1 ||
        (event.target.className as string).indexOf('os-resize-observer-host') !== -1
      if (isScrollingInScrollHost || isInSensor) { return }
      this._ngSelect.close()
    }
}

  /**
   * Temp fix for: https://github.com/ng-select/ng-select/issues/1122
   */
  // private _patch_ngSelect_open() {
  //   const original = this._ngSelect.open
  //   const _self = this
  //   this._ngSelect.open = function() {
  //     original.apply(this, arguments)
  //     _self._patch_ngSelectDropdownPanel_updateDropdownPosition()
  //   }
  // }

  /** Should ONLY be called by `_patch_ngSelect_open`. */
  // private _patch_ngSelectDropdownPanel_updateDropdownPosition() {
  //   if (!this._ngSelect.dropdownPanel) { return }
  //   const drop: any = this._ngSelect.dropdownPanel
  //   // Only needed once, to update the position before the timeout in
  //   // `updateDropdownPosition()`. So, using this variable to check if I already called
  //   // `_updateAppendedDropdownPosition()`.
  //   if (!drop.__libPatched) {
  //     drop.__libPatched = 'patched'
  //     const original = drop.updateDropdownPosition
  //     const _self = this
  //     drop.updateDropdownPosition = function() {
  //       original.apply(this, arguments)
  //       if (!!_self._ngSelect.appendTo) {
  //         drop._updateAppendedDropdownPosition()
  //       }
  //     }
  //   }
  // }

  private _enableKeyPressWorkaround() {
    if (this._keyPressWorkaroundSub) { return }
    const _ngSelect = this._ngSelect as any

    this._keyPressWorkaroundSub = _ngSelect._keyPress$
      .pipe(takeUntil(this._ngUnsubscribe))
      .pipe(filter(() => !this._ngSelect.searchable))
      .subscribe(() => {
        this._ngZone.runOutsideAngular(() => {
          window.requestAnimationFrame(() => {
            if (this._ngSelect.dropdownPanel) {
              this._markedItem = this._ngSelect.dropdownPanel.markedItem
            }
            this._checkMarked = true
          })
        })
      })
  }

  private _disableKeyPressWorkaround() {
    if (this._keyPressWorkaroundSub) {
      this._keyPressWorkaroundSub.unsubscribe()
      this._keyPressWorkaroundSub = null
    }
  }

}
