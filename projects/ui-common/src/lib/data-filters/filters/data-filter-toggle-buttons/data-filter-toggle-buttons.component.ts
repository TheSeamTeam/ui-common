import { coerceArray } from '@angular/cdk/coercion'
import { Component, forwardRef, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core'
import { FormControl } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators'

import { hasProperty, isNullOrUndefined } from '@lib/ui-common/utils'

import { DataFilterState, IDataFilter, THESEAM_DATA_FILTER, THESEAM_DATA_FILTER_OPTIONS } from '../../data-filter'
import { THESEAM_DATA_FILTER_CONTAINER } from '../../data-filter-container'
import type { DataFilterContainer } from '../../data-filter-container'
import { textDataFilter } from '../data-filter-text/data-filter-text.component'
import { ITextFilterOptions } from '../data-filter-text/text-filter-options'


export const DATA_FILTER_TOGGLE_BUTTON: any = {
  provide: THESEAM_DATA_FILTER,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DataFilterToggleButtonsComponent),
  multi: true,
}

export interface IToggleButton {
  name: string
  value: string
  comparator?: (value, row, index) => -1 | 0 | 1
}

export interface IToggleButtonsFilterOptions extends ITextFilterOptions {
  selectionToggleable: boolean
  multiple: boolean
  buttons: IToggleButton[]
  initialValue?: any
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

let _uid = 0

@Component({
  selector: 'seam-data-filter-toggle-buttons',
  templateUrl: './data-filter-toggle-buttons.component.html',
  styleUrls: ['./data-filter-toggle-buttons.component.scss'],
  providers: [ DATA_FILTER_TOGGLE_BUTTON ]
})
export class DataFilterToggleButtonsComponent implements OnInit, OnDestroy, IDataFilter {

  public readonly name = 'toggle-buttons'
  public readonly uid = `toggle-buttons__${_uid++}`

  _control = new FormControl()

  @Input() properties = this._optDefault('properties')
  @Input() omitProperties = this._optDefault('omitProperties')
  @Input() multiple = this._optDefault('multiple')
  @Input() selectionToggleable = this._optDefault('selectionToggleable')
  @Input() buttons = this._optDefault('buttons')
  @Input() exact = this._optDefault('exact')
  @Input() caseSensitive = this._optDefault('caseSensitive')

  @Input()
  set value(value: string | string[]) {
    const _value = !isNullOrUndefined(value) ? coerceArray(value) : undefined
    // console.log('_value', _value, this._control.value)
    if (this._control.value !== _value) {
      this._control.setValue(_value)
    }
  }

  public readonly filterStateChanges: Observable<DataFilterState>

  constructor(
    @Inject(THESEAM_DATA_FILTER_CONTAINER) private _filterContainer: DataFilterContainer,
    @Optional() @Inject(THESEAM_DATA_FILTER_OPTIONS) private _filterOptions: IToggleButtonsFilterOptions | null
  ) {
    this.filterStateChanges = this._control.valueChanges.pipe(
      tap(v => console.log('v', v)),
      switchMap(() => of(this.filterState())),
      tap(v => console.log('v2', v)),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  ngOnInit() {
    this._filterContainer.addFilter(this)
    if (this._filterOptions && hasProperty(this._filterOptions, 'initialValue')) {
      this.value = this._optDefault('initialValue')
    }
  }

  ngOnDestroy() { this._filterContainer.removeFilter(this) }

  private _optDefault<K extends keyof IToggleButtonsFilterOptions>(prop: K) {
    if (this._filterOptions && this._filterOptions.hasOwnProperty(prop)) {
      return this._filterOptions[prop]
    }
    return DefaultToggleButtonsFilterOptions[prop]
  }

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
        map(v => toggleButtonsFilter(data, coerceArray(v), this.options)),
        startWith(toggleButtonsFilter(data, coerceArray(this._control.value), this.options)),
      )
  }

  public filterState(): DataFilterState {
    return {
      // id:
      name: this.name,
      state: {
        value: this._control.value,
        options: this.options
      }
    }
  }

}
