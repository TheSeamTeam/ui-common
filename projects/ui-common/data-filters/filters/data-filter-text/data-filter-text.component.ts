import { BooleanInput } from '@angular/cdk/coercion'
import { Component, forwardRef, Inject, Input, OnDestroy, OnInit, Optional, TemplateRef } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { InputBoolean } from '@theseam/ui-common/core'
import { isNullOrUndefined } from '@theseam/ui-common/utils'

import { DataFilterState, IDataFilter, THESEAM_DATA_FILTER, THESEAM_DATA_FILTER_OPTIONS } from '../../data-filter'
import { THESEAM_DATA_FILTER_CONTAINER } from '../../data-filter-container'
import type { DataFilterContainer } from '../../data-filter-container'
import { ITextFilterOptions } from './text-filter-options'

export const DATA_FILTER_TEXT: any = {
  provide: THESEAM_DATA_FILTER,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DataFilterTextComponent),
  multi: true,
}

export const DefaultTextFilterOptions: ITextFilterOptions = {
  properties: undefined,
  omitProperties: undefined,
  exact: false,
  caseSensitive: false,
}

export function textDataFilter(data: any[], text: string, options = DefaultTextFilterOptions) {
  if (!data || !text) {
    return data
  }

  if (data.length <= 0) {
    return data
  }

  let props = options ? options.properties : undefined
  if (!props) {
    props = []
    let keys = Object.keys(data[0])
    if (options && options.omitProperties) {
      keys = keys.filter(key => !(options.omitProperties || []).find(p => p === key))
    }
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(data[0], key)) {
        props.push(key)
      }
    }
  }

  const filtered: any[] = []

  for (const item of data) {
    for (const p of props) {
      let value1 = `${item[p]}`
      let value2 = text

      if (!options.caseSensitive) {
        value1 = value1.toLowerCase()
        value2 = value2.toLowerCase()
      }

      if (item[p] && value1.indexOf(value2) !== (options.exact ? 0 : -1)) {
        filtered.push(item)
        break
      }
    }
  }

  return filtered
}

let _uid = 0

@Component({
  selector: 'seam-data-filter-text',
  templateUrl: './data-filter-text.component.html',
  styleUrls: ['./data-filter-text.component.scss'],
  providers: [ DATA_FILTER_TEXT ]
})
export class DataFilterTextComponent implements OnInit, OnDestroy, IDataFilter {
  static ngAcceptInputType_exact: BooleanInput
  static ngAcceptInputType_caseSensitive: BooleanInput

  public readonly name = 'text'
  public readonly uid = `text__${_uid++}`

  _control = new UntypedFormControl()

  @Input() properties: string[] | undefined | null = this._optDefault('properties')
  @Input() omitProperties: string[] | undefined | null = this._optDefault('omitProperties')
  @Input() @InputBoolean() exact: boolean = this._optDefault('exact')
  @Input() @InputBoolean() caseSensitive: boolean = this._optDefault('caseSensitive')

  @Input() placeholder: string | undefined | null
  @Input() iconTpl: TemplateRef<HTMLElement> | undefined | null

  @Input()
  set value(value: string | string[]) {
    const _value = !isNullOrUndefined(value) ? `${value}` : ''
    if (this._control.value !== _value) {
      this._control.setValue(_value)
    }
  }

  public readonly filterStateChanges: Observable<DataFilterState>

  constructor(
    @Inject(THESEAM_DATA_FILTER_CONTAINER) private _filterContainer: DataFilterContainer,
    @Optional() @Inject(THESEAM_DATA_FILTER_OPTIONS) private _filterOptions: ITextFilterOptions | null
  ) {
    this.filterStateChanges = this._control.valueChanges.pipe(
      switchMap(() => of(this.filterState())),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  ngOnInit() { this._filterContainer.addFilter(this) }

  ngOnDestroy() { this._filterContainer.removeFilter(this) }

  private _optDefault<K extends keyof ITextFilterOptions>(prop: K) {
    if (this._filterOptions && Object.prototype.hasOwnProperty.call(this._filterOptions, prop)) {
      return this._filterOptions[prop]
    }
    return DefaultTextFilterOptions[prop]
  }

  get options(): ITextFilterOptions {
    return {
      properties: this.properties ?? undefined,
      omitProperties: this.omitProperties ?? undefined,
      exact: this.exact,
      caseSensitive: this.caseSensitive
    }
  }

  public filter<T>(data: T[]): Observable<T[]> {
    return this._control.valueChanges
      .pipe(
        map(v => textDataFilter(data, v, this.options)),
        startWith(textDataFilter(data, this._control.value, this.options)),
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
