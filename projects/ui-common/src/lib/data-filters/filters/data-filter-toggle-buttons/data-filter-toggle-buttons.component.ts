import { coerceArray } from '@angular/cdk/coercion'
import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { untilDestroyed } from 'ngx-take-until-destroy'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

import { isNullOrUndefined } from '../../../utils'

import { IDataFilter, THESEAM_DATA_FILTER } from '../../data-filter'
import { ITextFilterOptions, textDataFilter } from '../data-filter-text/data-filter-text.component'


export const DATA_FILTER_TOGGLE_BUTTON: any = {
  provide: THESEAM_DATA_FILTER,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DataFilterToggleButtonsComponent),
  multi: true,
}

export interface IToggleButton {
  name: string
  value: string
  comparator: (value, row, index) => -1 | 0 | 1
}

export interface IToggleButtonsFilterOptions extends ITextFilterOptions {
  selectionToggleable: boolean
  multiple: boolean
  buttons: IToggleButton[]
}

export const DefaultToggleButtonsFilterOptions: IToggleButtonsFilterOptions = {
  properties: undefined,
  omitProperties: undefined,
  multiple: false,
  selectionToggleable: false,
  buttons: [],
  exact: false,
  caseSensitive: false
}

export function toggleButtonsFilter(data: any[], values: string[], options = DefaultToggleButtonsFilterOptions) {
  if (!data || !values) {
    return data
  }

  const customComparatorBtns: IToggleButton[] = []
  for (const btn of options.buttons) {
    if (btn.comparator) {
      customComparatorBtns.push(btn)
    }
  }

  let _data = data
  for (const val of values) {
    if (val === '') { continue }

    let cmp
    for (const btn of customComparatorBtns) {
      if (btn.value === val) {
        cmp = btn.comparator
      }
    }
    if (cmp) {
      const filtered: any[] = []
      for (let i = 0; i < _data.length; i++) {
        if (cmp(val, data[i], i) !== -1) {
          filtered.push(data[i])
        }
      }
      _data = filtered
    } else {
      _data = textDataFilter(_data, val, {
        properties: options.properties,
        omitProperties: options.omitProperties,
        exact: options.exact,
        caseSensitive: options.caseSensitive
      })
    }
  }
  return _data
}

@Component({
  selector: 'seam-data-filter-toggle-buttons',
  templateUrl: './data-filter-toggle-buttons.component.html',
  styleUrls: ['./data-filter-toggle-buttons.component.scss'],
  providers: [ DATA_FILTER_TOGGLE_BUTTON ]
})
export class DataFilterToggleButtonsComponent implements OnInit, OnDestroy, IDataFilter {

  _control = new FormControl()

  @Input() properties: string[]
  @Input() omitProperties: string[]
  @Input() multiple: boolean
  @Input() selectionToggleable: boolean
  @Input() buttons: IToggleButton[]
  @Input() exact: boolean
  @Input() caseSensitive: boolean

  @Input()
  set value(value: string | string[]) {
    const _value = !isNullOrUndefined(value) ? coerceArray(value) : undefined
    if (this._control.value !== _value) {
      this._control.setValue(_value)
    }
  }

  constructor() { }

  ngOnInit() { }

  ngOnDestroy() { }

  get options(): IToggleButtonsFilterOptions {
    return {
      properties: this.properties,
      omitProperties: this.omitProperties,
      multiple: this.multiple,
      selectionToggleable: this.selectionToggleable,
      buttons: this.buttons,
      exact: this.exact,
      caseSensitive: this.caseSensitive
    }
  }

  public filter<T>(data: T[]): Observable<T[]> {
    return this._control.valueChanges
      .pipe(
        untilDestroyed(this),
        map(v => toggleButtonsFilter(data, coerceArray(v), this.options)),
        startWith(toggleButtonsFilter(data, coerceArray(this._control.value), this.options)),
      )
  }

}
