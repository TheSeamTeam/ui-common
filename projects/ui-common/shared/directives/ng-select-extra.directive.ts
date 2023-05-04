import { AfterViewChecked, Directive, ElementRef, EventEmitter, HostBinding,
  HostListener, NgZone, OnDestroy, OnInit, Optional, Self } from '@angular/core'
import { NgControl } from '@angular/forms'
import { Subject, Subscription } from 'rxjs'
import { filter, takeUntil } from 'rxjs/operators'

import { NgOption, NgSelectComponent } from '@ng-select/ng-select'
import { ResizeSensor } from 'css-element-queries'

import { IElementResizedEvent } from './elem-resized.directive'

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ng-select'
})
export class NgSelectExtraDirective implements OnInit, AfterViewChecked, OnDestroy {

  private readonly _ngUnsubscribe = new Subject<void>()

  private _markedItem: NgOption | null = null
  private _checkMarked = false
  private _keyPressWorkaroundSub: Subscription | null = null

  private _resizedEvent = new EventEmitter<IElementResizedEvent>()
  private _resizeSensor?: ResizeSensor

  /**
   * Set the tab index to `-1` to allow the root element of the ng-select
   * component to receive `focus` event from javascript, but not get focused by
   * keyboard navigation.
   */
  @HostBinding('attr.tabIndex')
  get _tabIndex() { return this.ngSelect.disabled ? undefined : -1 }

  /**
   * Listening for focus event on root of component to allow javascript
   * `focus()` function to trigger the components focus.
   */
  @HostListener('focus', ['$event']) onFocus($event: FocusEvent) {
    const target = $event.target as HTMLElement
    if (target === this.elementRef.nativeElement && !this.ngSelect.disabled) {
      this.ngSelect.focus()
    }

    // ng-select has an input `labelForId` that sets the autocomplete attribute
    // in ngOnInit. I am not positive that it is wrong by doing that, but this
    // hack makes it set the attributes again on focus, because that gives the
    // result I was expecting, since we don't manually set the `labelForId`
    // input.
    const _ngSelect = this.ngSelect as any
    _ngSelect._setInputAttributes()
  }

  @HostBinding('class.is-invalid') get _isInvalid() {
    return this.ngControl ? this.ngControl.invalid && (this.ngControl.dirty || this.ngControl.touched) : false
  }

  @HostBinding('class.ng-empty-string-value') get _isEmptyStringValue() {
    return this.ngControl ? this.ngControl.value === '' : false
  }

  constructor(
    private readonly elementRef: ElementRef,
    private readonly _ngZone: NgZone,
    private readonly ngSelect: NgSelectComponent,
    @Optional() @Self() public readonly ngControl: NgControl
  ) { }

  ngOnInit() {
    this.ngSelect.focusEvent
      .subscribe(v => this._enableKeyPressWorkaround())

    this.ngSelect.blurEvent
      .subscribe(v => this._disableKeyPressWorkaround())

    window.addEventListener('scroll', this._onScroll, true)

    // When the input is allowed to change its height the position doesn't update itself.
    // this._resizedEvent.pipe(
    //   auditTime(30)
    // ).subscribe(event => {
    //   if (this.elementRef && this.elementRef.nativeElement) {
    //     if (this.elementRef.nativeElement.classList.contains('ng-select-value-grow-h')) {
    //       if (this.ngSelect.isOpen && this.ngSelect.dropdownPanel) {
    //         this.ngSelect.dropdownPanel.updateDropdownPosition()
    //       }
    //     } else {
    //       this.elementRef.nativeElement.classList.remove('ng-select-value-grow-h')
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
    if (this.ngSelect.dropdownPanel) {
      if (this._checkMarked) {
        if (this.ngSelect.dropdownPanel && this._markedItem !== null) {
          if (this._markedItem.index !== this.ngSelect.dropdownPanel.markedItem.index) {
            this.ngSelect.dropdownPanel.scrollTo(this.ngSelect.dropdownPanel.markedItem)
          }
        }
      }
    }
    this._checkMarked = false

    this._resizeSensor = new ResizeSensor(this.elementRef.nativeElement, event => {
      this._resizedEvent.emit({ element: this.elementRef.nativeElement, size: event })
    })
  }

  private _onScroll = (event: any) => {
    if (this.ngSelect && this.ngSelect.isOpen) {
      const isScrollingInScrollHost = (event.target.className as string).indexOf('ng-dropdown-panel-items') !== -1
      const isInSensor = (event.target.className as string).indexOf('resize-sensor-shrink') !== -1 ||
        (event.target.className as string).indexOf('os-resize-observer-host') !== -1
      if (isScrollingInScrollHost || isInSensor) { return }
      this.ngSelect.close()
    }
}

  /**
   * Temp fix for: https://github.com/ng-select/ng-select/issues/1122
   */
  // private _patch_ngSelect_open() {
  //   const original = this.ngSelect.open
  //   const _self = this
  //   this.ngSelect.open = function() {
  //     original.apply(this, arguments)
  //     _self._patch_ngSelectDropdownPanel_updateDropdownPosition()
  //   }
  // }

  /** Should ONLY be called by `_patch_ngSelect_open`. */
  // private _patch_ngSelectDropdownPanel_updateDropdownPosition() {
  //   if (!this.ngSelect.dropdownPanel) { return }
  //   const drop: any = this.ngSelect.dropdownPanel
  //   // Only needed once, to update the position before the timeout in
  //   // `updateDropdownPosition()`. So, using this variable to check if I already called
  //   // `_updateAppendedDropdownPosition()`.
  //   if (!drop.__libPatched) {
  //     drop.__libPatched = 'patched'
  //     const original = drop.updateDropdownPosition
  //     const _self = this
  //     drop.updateDropdownPosition = function() {
  //       original.apply(this, arguments)
  //       if (!!_self.ngSelect.appendTo) {
  //         drop._updateAppendedDropdownPosition()
  //       }
  //     }
  //   }
  // }

  private _enableKeyPressWorkaround() {
    if (this._keyPressWorkaroundSub) { return }
    const _ngSelect = this.ngSelect as any

    this._keyPressWorkaroundSub = _ngSelect._keyPress$
      .pipe(takeUntil(this._ngUnsubscribe))
      .pipe(filter(() => !this.ngSelect.searchable))
      .subscribe(() => {
        this._ngZone.runOutsideAngular(() => {
          window.requestAnimationFrame(() => {
            if (this.ngSelect.dropdownPanel) {
              this._markedItem = this.ngSelect.dropdownPanel.markedItem
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
