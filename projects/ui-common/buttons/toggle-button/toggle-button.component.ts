import { FocusMonitor } from '@angular/cdk/a11y'
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  Component, ElementRef, EventEmitter,
  forwardRef, HostBinding, Input, OnDestroy, Output, Renderer2
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

import { InputBoolean } from '@theseam/ui-common/core'

import { ButtonComponent } from '../button/button.component'


export const TOGGLE_BUTTON_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => ToggleButtonComponent),
  multi: true,
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'button[seamToggleButton]',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss'],
  exportAs: 'seamToggleButton',
  // tslint:disable-next-line:use-input-property-decorator
  inputs: [ 'disabled', 'theme', 'size' ],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[attr.type]': 'type',
    'class': 'btn',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
    '(click)': '_toggleValue()',
  },
  providers: [ TOGGLE_BUTTON_VALUE_ACCESSOR ]
})
export class ToggleButtonComponent extends ButtonComponent implements OnDestroy, ControlValueAccessor {
  static ngAcceptInputType_val: BooleanInput

  // tslint:disable-next-line:no-input-rename
  @Input('value') @InputBoolean() val: boolean = false

  @Output() readonly change = new EventEmitter<boolean>()

  onChange: any
  onTouched: any

  @HostBinding('class.active')
  get _activeCssClass() { return this.value ? coerceBooleanProperty(this.value) : false}

  constructor(
    readonly _elementRef: ElementRef,
    readonly _focusMonitor: FocusMonitor,
    readonly _renderer: Renderer2
  ) { super(_elementRef, _focusMonitor, _renderer) }

  ngOnDestroy() { super.ngOnDestroy() }

  get value(): boolean {
    return this.val
  }

  set value(value: boolean) {
    this.val = value
    this.change.emit(this.val)
    if (this.onChange) { this.onChange(value) }
    if (this.onTouched) { this.onTouched() }
  }

  writeValue(value: any): void {
    this.value = value
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  _toggleValue() {
    this.value = !this.value
  }

}