import { BooleanInput, coerceArray } from '@angular/cdk/coercion'
import { AfterViewInit, ContentChildren, Directive, EventEmitter, forwardRef, Input, OnDestroy, Output, QueryList } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { combineLatest, from, Observable, of, Subject } from 'rxjs'
import { filter, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators'

import { InputBoolean } from '@theseam/ui-common/core'

import { ToggleGroupOptionDirective } from './toggle-group-option.directive'

export const TOGGLE_GROUP_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ToggleGroupDirective),
  multi: true,
}

@Directive({
  selector: '[seamToggleGroup]',
  exportAs: 'seamToggleGroup',
  providers: [ TOGGLE_GROUP_VALUE_ACCESSOR ]
})
export class ToggleGroupDirective implements OnDestroy, AfterViewInit, ControlValueAccessor {
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_multiple: BooleanInput
  static ngAcceptInputType_selectionToggleable: BooleanInput

  private readonly _ngUnsubscribe = new Subject<void>()

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('value') val: string | string[] | undefined | null

  @Input() @InputBoolean() disabled = false
  @Input() @InputBoolean() multiple = false
  @Input() @InputBoolean() selectionToggleable = true

  // TODO: Add min/max selected inputs to make toggling better for multi select

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() readonly change = new EventEmitter<string | string[] | undefined | null>()

  @ContentChildren(ToggleGroupOptionDirective) optionDirectives?: QueryList<ToggleGroupOptionDirective>

  public options?: Observable<ToggleGroupOptionDirective[]>

  onChange: any
  onTouched: any

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this._updateDirectiveStates()

      if (this.optionDirectives) {
        this.options = this.optionDirectives.changes
          .pipe(takeUntil(this._ngUnsubscribe))
          .pipe(startWith(this.optionDirectives))
          .pipe(map(v => v.toArray() as ToggleGroupOptionDirective[]))

        this.options.pipe(switchMap(opts => {
          const _tmp = of(undefined)
          if (opts) {
            const _v: Observable<boolean>[] = []
            for (const opt of opts) {
              _v.push(opt.selectionChange.pipe(
                filter(v => opt.selected !== this.isSelected(opt.value)),
                tap(v => {
                  if (this.isSelected(opt.value)) {
                    this.unselectValue(opt.value)
                  } else {
                    this.selectValue(opt.value)
                  }
                })
              ))
            }
            return combineLatest(_v)
          }
          return _tmp
        })).subscribe()
      }

      this.change
        .pipe(switchMap(_ => from(this.optionDirectives?.toArray() || [])
          .pipe(tap(opt => { this._updateDirectiveState(opt) }))
        ))
        .subscribe()
    })

    this.optionDirectives?.changes.subscribe(() => this._updateDirectiveStates())
  }

  get value(): string | string[] | undefined | null {
    return this.val
  }

  set value(value: string | string[] | undefined | null) {
    const _value = this.multiple
      ? value !== null && value !== undefined
        ? coerceArray(value)
        : value
      : value

    this.val = (this.multiple) ? [ ...(_value as string[] || []) ] : _value || ''
    this.change.emit(this.val)
    if (this.onChange) { this.onChange(_value) }
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

  isSelected(value: string | undefined | null) {
    if (this.multiple) {
      const idx = (this.value as string[] || []).findIndex(v => v === value)
      return idx !== -1
    } else {
      // TODO: Clean this up when the directive no longer allows array value type when multiple is false
      const v = Array.isArray(this.value) && this.value.length === 1
        ? this.value[0]
        : this.value
      return v === value
    }
  }

  unselectValue(value: string | undefined | null) {
    if (this.multiple) {
      this.value = (this.value as string[] || []).filter(v => v !== value)
    } else {
      this.value = undefined
    }
  }

  selectValue(value: string | undefined | null) {
    if (this.multiple) {
      const _value = [ ...(this.value as string[] || []) ]
      this.value = value ? [ ..._value, value ] : _value
    } else {
      this.value = value
    }
  }

  getOptionDirectiveByValue(value: string) {
    if (!this.optionDirectives || this.optionDirectives.length < 1) {
      return null
    }

    return this.optionDirectives.toArray()
      .find(opt => opt.value === value)
  }

  private _updateDirectiveStates(): void {
    if (this.optionDirectives) {
      for (const opt of this.optionDirectives.toArray()) {
        this._updateDirectiveState(opt)
      }
    }
  }

  private _updateDirectiveState(opt: ToggleGroupOptionDirective): void {
    const selected = this.isSelected(opt.value)
    if (opt.selected !== selected) {
      if (!opt._canUnselect) {
        opt._canUnselect = true
      }
      opt.selected = selected
    }
    if (!this.selectionToggleable) {
      if (!this.multiple || (this.value && this.value.length <= 1)) {
        if (opt.selected) {
          if (opt._canUnselect) {
            opt._canUnselect = false
          }
        } else {
          if (!opt._canUnselect) {
            opt._canUnselect = true
          }
        }
      } else {
        if (!opt._canUnselect) {
          opt._canUnselect = true
        }
      }
    }
  }

}
