import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

import { CanDisable, CanDisableCtor, HasTabIndex, HasTabIndexCtor, mixinDisabled, mixinTabIndex } from '../core/common-behaviors/index'

// NOTE: Partially based on mat-checkbox: https://github.com/angular/components/blob/master/src/material/checkbox/checkbox.ts

/** Change event object emitted by TheSeamCheckboxComponent. */
export class TheSeamCheckboxChange {
  /** The source TheSeamCheckboxComponent of the event. */
  source: TheSeamCheckboxComponent
  /** The new `checked` value of the checkbox. */
  checked: boolean
}

export const THESEAM_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => TheSeamCheckboxComponent),
  multi: true
}

class TheSeamCheckboxComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _MatCheckboxMixinBase: HasTabIndexCtor & CanDisableCtor &
  typeof TheSeamCheckboxComponentBase =
    mixinTabIndex(mixinDisabled(TheSeamCheckboxComponentBase))

let _uid = 0

/**
 * A Checkbox.
 */
@Component({
  selector: 'seam-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  exportAs: 'seamCheckbox',
  host: {
    '[attr.tabindex]': 'null',
    'class': 'custom-control custom-checkbox'
  },
  providers: [ THESEAM_CHECKBOX_CONTROL_VALUE_ACCESSOR ],
  inputs: [ 'tabIndex' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamCheckboxComponent extends _MatCheckboxMixinBase
  implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor, CanDisable, HasTabIndex {

  /** @ignore */
  private _uid = `seam-chk-${_uid++}`

  /** A unique id for the checkbox input. If none is supplied, it will be auto-generated. */
  @Input() id?: string = this._uid

  /** Returns the unique id for the input. */
  get inputId(): string { return `${this.id || this._uid}` }

  /**
   * Attached to the aria-label attribute of the host element. In most cases, aria-labelledby will
   * take precedence so this may be omitted.
   */
  @Input('aria-label') ariaLabel?: string = ''

  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  @Input('aria-labelledby') ariaLabelledby?: string | null = null

  /** Whether the checkbox is required. */
  @Input()
  get required(): boolean { return this._required }
  set required(value: boolean) { this._required = coerceBooleanProperty(value) }
  /** @ignore */
  private _required: boolean

  /**
   * Whether the checkbox is checked.
   */
  @Input()
  get checked(): boolean { return this._checked }
  set checked(value: boolean) {
    if (value !== this.checked) {
      this._checked = value
      this._changeDetectorRef.markForCheck()
    }
  }
  /** @ignore */
  private _checked = false

  /**
   * Whether the checkbox is disabled.
   */
  // This fully overrides the implementation provided by mixinDisabled, but the
  // mixin is still required because mixinTabIndex requires it.
  @Input()
  get disabled(): boolean { return this._disabled }
  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value)

    if (newValue !== this.disabled) {
      this._disabled = newValue
      this._changeDetectorRef.markForCheck()
    }
  }
  /** @ignore */
  private _disabled = false

  /**
   * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
   * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
   * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
   * set to false.
   */
  @Input()
  get indeterminate(): boolean { return this._indeterminate }
  set indeterminate(value: boolean) {
    const changed = value !== this._indeterminate
    this._indeterminate = coerceBooleanProperty(value)

    if (changed) {
      this.indeterminateChange.emit(this._indeterminate)
    }

    this._syncIndeterminate(this._indeterminate)
  }
  /** @ignore */
  private _indeterminate = false

  /** Name value will be applied to the input element if present */
  @Input() name: string | null = null

  /** Event emitted when the checkbox's `checked` value changes. */
  @Output() readonly change = new EventEmitter<TheSeamCheckboxChange>()

  /** Event emitted when the checkbox's `indeterminate` value changes. */
  @Output() readonly indeterminateChange: EventEmitter<boolean> = new EventEmitter<boolean>()

  /** The value attribute of the native input element */
  @Input() value: string

  /**
   * The native `<input type="checkbox">` element
   * @ignore
   */
  @ViewChild('input', { static: true }) _inputElement: ElementRef<HTMLInputElement>

  /**
   * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
   * @ignore
   */
  _onTouched: () => any = () => {}

  /** @ignore */
  private _controlValueAccessorChangeFn: (value: any) => void = () => {}

  constructor(
    elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _focusMonitor: FocusMonitor,
    private _ngZone: NgZone,
    @Attribute('tabindex') tabIndex: string
  ) {
    super(elementRef)

    this.tabIndex = parseInt(tabIndex, 10) || 0

    this._focusMonitor.monitor(elementRef, true).subscribe(focusOrigin => {
      if (!focusOrigin) {
        // When a focused element becomes disabled, the browser *immediately* fires a blur event.
        // Angular does not expect events to be raised during change detection, so any state change
        // (such as a form control's 'ng-touched') will cause a changed-after-checked error.
        // See https://github.com/angular/angular/issues/17793. To work around this, we defer
        // telling the form control it has been touched until the next tick.
        Promise.resolve().then(() => {
          this._onTouched()
          _changeDetectorRef.markForCheck()
        })
      }
    })
  }

  /** @ignore */
  ngOnInit() { }

  /** @ignore */
  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef)
  }

  /** @ignore */
  ngAfterViewInit() {
    this._syncIndeterminate(this._indeterminate)
  }

  /**
   * Method being called whenever the label text changes.
   * @ignore
   */
  _onLabelTextChange() {
    // Since the event of the `cdkObserveContent` directive runs outside of the zone, the checkbox
    // component will be only marked for check, but no actual change detection runs automatically.
    // Instead of going back into the zone in order to trigger a change detection which causes
    // *all* components to be checked (if explicitly marked or not using OnPush), we only trigger
    // an explicit change detection for the checkbox view and its children.
    this._changeDetectorRef.detectChanges()
  }

  // Implemented as part of ControlValueAccessor.
  /** @ignore */
  writeValue(value: any) {
    this.checked = !!value
  }

  // Implemented as part of ControlValueAccessor.
  /** @ignore */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn
  }

  // Implemented as part of ControlValueAccessor.
  /** @ignore */
  registerOnTouched(fn: any) {
    this._onTouched = fn
  }

  // Implemented as part of ControlValueAccessor.
  /** @ignore */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled
  }

  /** @ignore */
  _getAriaChecked(): 'true' | 'false' | 'mixed' {
    return this.checked ? 'true' : (this.indeterminate ? 'mixed' : 'false')
  }

  /** @ignore */
  private _emitChangeEvent() {
    const event = new TheSeamCheckboxChange()
    event.source = this
    event.checked = this.checked

    this._controlValueAccessorChangeFn(this.checked)
    this.change.emit(event)
  }

  /** Toggles the `checked` state of the checkbox. */
  toggle(): void {
    this.checked = !this.checked
  }

  /**
   * Event handler for checkbox input element.
   * Toggles checked state if element is not disabled.
   * Do not toggle on (change) event since IE doesn't fire change event when
   *   indeterminate checkbox is clicked.
   * @ignore
   */
  _onInputClick(event: Event) {
    // If resetIndeterminate is false, and the current state is indeterminate, do nothing on click
    if (!this.disabled) {
      // When user manually click on the checkbox, `indeterminate` is set to false.
      if (this.indeterminate) {

        Promise.resolve().then(() => {
          this._indeterminate = false
          this.indeterminateChange.emit(this._indeterminate)
        })
      }

      this.toggle()

      // Emit our custom change event if the native input emitted one.
      // It is important to only emit it, if the native input triggered one, because
      // we don't want to trigger a change event, when the `checked` variable changes for example.
      this._emitChangeEvent()
    }
  }

  /** Focuses the checkbox. */
  focus(origin: FocusOrigin = 'keyboard', options?: FocusOptions): void {
    this._focusMonitor.focusVia(this._inputElement, origin, options)
  }

  /** @ignore */
  _onInteractionEvent(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation()
  }

  /**
   * Syncs the indeterminate value with the checkbox DOM node.
   *
   * We sync `indeterminate` directly on the DOM node, because in Ivy the check for whether a
   * property is supported on an element boils down to `if (propName in element)`. Domino's
   * HTMLInputElement doesn't have an `indeterminate` property so Ivy will warn during
   * server-side rendering.
   * @ignore
   */
  private _syncIndeterminate(value: boolean) {
    const nativeCheckbox = this._inputElement

    if (nativeCheckbox) {
      nativeCheckbox.nativeElement.indeterminate = value
    }
  }

}
