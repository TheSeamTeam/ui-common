import { BooleanInput, coerceArray } from '@angular/cdk/coercion'
import {
  ContentChildren,
  Directive,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  QueryList,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

import { InputBoolean } from '@theseam/ui-common/core'

import { THESEAM_TOGGLE_GROUP_PARENT } from './toggle-group-parent'
import { ToggleGroupOptionDirective } from './toggle-group-option.directive'

export const TOGGLE_GROUP_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ToggleGroupDirective),
  multi: true,
}

@Directive({
  selector: '[seamToggleGroup]',
  exportAs: 'seamToggleGroup',
  providers: [
    TOGGLE_GROUP_VALUE_ACCESSOR,
    {
      provide: THESEAM_TOGGLE_GROUP_PARENT,
      useExisting: forwardRef(() => ToggleGroupDirective),
    },
  ],
})
export class ToggleGroupDirective implements ControlValueAccessor {
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_multiple: BooleanInput
  static ngAcceptInputType_selectionToggleable: BooleanInput

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('value') val: string | string[] | undefined | null

  @Input() @InputBoolean() disabled = false
  @Input() @InputBoolean() multiple = false
  @Input() @InputBoolean() selectionToggleable = true

  // TODO: Add min/max selected inputs to make toggling better for multi select

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() readonly change = new EventEmitter<
    string | string[] | undefined | null
  >()

  @ContentChildren(ToggleGroupOptionDirective)
  optionDirectives?: QueryList<ToggleGroupOptionDirective>

  onChange: any
  onTouched: any

  get value(): string | string[] | undefined | null {
    return this.val
  }

  set value(value: string | string[] | undefined | null) {
    const _value = this.multiple
      ? value !== null && value !== undefined
        ? coerceArray(value)
        : value
      : value

    this.val = this.multiple ? [...((_value as string[]) || [])] : _value || ''
    this.change.emit(this.val)
    if (this.onChange) {
      this.onChange(_value)
    }
    if (this.onTouched) {
      this.onTouched()
    }
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

  isSelected(value: string | undefined | null) {
    if (this.multiple) {
      const idx = ((this.value as string[]) || []).findIndex((v) => v === value)
      return idx !== -1
    } else {
      // TODO: Clean this up when the directive no longer allows array value type when multiple is false
      const v =
        Array.isArray(this.value) && this.value.length === 1
          ? this.value[0]
          : this.value
      return v === value
    }
  }

  /**
   * Toggles an option's selected state by value.
   */
  toggleOptionSelect(value: string | undefined | null): void {
    if (this.isSelected(value)) {
      if (!this.selectionToggleable && this._selectedCount() <= 1) {
        // Unselecting would leave nothing selected.
        return
      }
      this.unselectValue(value)
      return
    }

    this.selectValue(value)
  }

  private _selectedCount(): number {
    if (this.multiple) {
      return ((this.value as string[]) || []).length
    }
    const v = this.value
    return v === null || v === undefined || v === '' ? 0 : 1
  }

  unselectValue(value: string | undefined | null) {
    if (this.multiple) {
      this.value = ((this.value as string[]) || []).filter((v) => v !== value)
    } else {
      this.value = undefined
    }
  }

  selectValue(value: string | undefined | null) {
    if (this.multiple) {
      const _value = [...((this.value as string[]) || [])]
      this.value = value ? [..._value, value] : _value
    } else {
      this.value = value
    }
  }

  getOptionDirectiveByValue(
    value: string,
  ): ToggleGroupOptionDirective | null | undefined {
    if (!this.optionDirectives || this.optionDirectives.length < 1) {
      return null
    }

    return this.optionDirectives.toArray().find((opt) => opt.value === value)
  }
}
