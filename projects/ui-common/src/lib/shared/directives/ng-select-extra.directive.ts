import { AfterViewChecked, Directive, ElementRef, HostBinding, HostListener,
  NgZone, OnDestroy, OnInit, Optional, Self } from '@angular/core'
import { NgControl } from '@angular/forms'
import { NgOption, NgSelectComponent } from '@ng-select/ng-select'
import { untilDestroyed } from 'ngx-take-until-destroy'
import { Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'ng-select'
})
export class NgSelectExtraDirective implements OnInit, AfterViewChecked, OnDestroy {

  private _labelForId: string

  private _markedItem: NgOption | null = null
  private _checkMarked = false
  private _keyPressWorkaroundSub: Subscription | null = null

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

    // Disables the labelForId on focus to avoid the browser autofill popup.
    this._labelForId = this.ngSelect.labelForId
    this.ngSelect.labelForId = null
  }

  @HostListener('blur', ['$event']) onBlur($event: any) {
    // Timeout to avoid `ExpressionChangedAfterItHasBeenCheckedError`
    setTimeout(() => {
      // Re-enable the labelForId on blur to enable autofill to work if triggered
      // outside the ng-select component and allow the label to focus input on
      // click again.
      this.ngSelect.labelForId = this._labelForId
    })
  }

  @HostBinding('class.is-invalid') get _isInvalid() {
    return this.ngControl ? this.ngControl.invalid && (this.ngControl.dirty || this.ngControl.touched) : false
  }

  @HostBinding('class.ng-empty-string-value') get _isEmptyStringValue() {
    return this.ngControl ? this.ngControl.value === '' ? true : false : false
  }

  constructor(
    private elementRef: ElementRef,
    private _ngZone: NgZone,
    private ngSelect: NgSelectComponent,
    @Optional() @Self() public ngControl: NgControl
  ) { }

  ngOnInit() {
    this.ngSelect.focusEvent
      .subscribe(v => this._enableKeyPressWorkaround())

    this.ngSelect.blurEvent
      .subscribe(v => this._disableKeyPressWorkaround())

    this._patch_ngSelect_open()
  }

  ngOnDestroy() { }

  ngAfterViewChecked() {
    if (this.ngSelect.dropdownPanel) {
      if (this._checkMarked) {
        if (this.ngSelect.dropdownPanel && this._markedItem !== null) {
          if (this._markedItem.index !== this.ngSelect.dropdownPanel.markedItem.index) {
            this.ngSelect.dropdownPanel.scrollInto(this.ngSelect.dropdownPanel.markedItem)
          }
        }
      }
    }
    this._checkMarked = false
  }

  /**
   * Temp fix for: https://github.com/ng-select/ng-select/issues/1122
   */
  private _patch_ngSelect_open() {
    const original = this.ngSelect.open
    const _self = this
    this.ngSelect.open = function() {
      original.apply(this, arguments)
      _self._patch_ngSelectDropdownPanel_updateDropdownPosition()
    }
  }

  /** Should ONLY be called by `_patch_ngSelect_open`. */
  private _patch_ngSelectDropdownPanel_updateDropdownPosition() {
    if (!this.ngSelect.dropdownPanel) { return }
    const drop: any = this.ngSelect.dropdownPanel
    // Only needed once, to update the position before the timeout in
    // `updateDropdownPosition()`. So, using this variable to check if I already called
    // `_updateAppendedDropdownPosition()`.
    if (!drop.__libPatched) {
      drop.__libPatched = 'patched'
      const original = drop.updateDropdownPosition
      const _self = this
      drop.updateDropdownPosition = function() {
        original.apply(this, arguments)
        if (!!_self.ngSelect.appendTo) {
          drop._updateAppendedDropdownPosition()
        }
      }
    }
  }

  private _enableKeyPressWorkaround() {
    if (this._keyPressWorkaroundSub) { return }
    const _ngSelect = <any>this.ngSelect

    this._keyPressWorkaroundSub = _ngSelect._keyPress$
      .pipe(untilDestroyed(this))
      .pipe(filter(v => !this.ngSelect.searchable))
      .subscribe(v => {
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
