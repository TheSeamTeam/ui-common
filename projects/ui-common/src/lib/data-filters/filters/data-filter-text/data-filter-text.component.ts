import { Component, forwardRef, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { FormControl } from '@angular/forms'
import { untilDestroyed } from 'ngx-take-until-destroy'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

import { isNullOrUndefined } from '../../../utils/index'
import { IDataFilter, THESEAM_DATA_FILTER } from '../../data-filter'

export const DATA_FILTER_TEXT: any = {
  provide: THESEAM_DATA_FILTER,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DataFilterTextComponent),
  multi: true,
}

export interface ITextFilterOptions {
  /**
   * Limits filtering to these properties only.
   */
  properties?: string[]
  /**
   * When all properties are used this will omit those properties. This option
   * does nothing when `properties` option is defined.
   */
  omitProperties?: string[]
  /**
   * When using a loose matching, such as the default text filter that uses
   * string contains, this will tell the filter to use exact matching.
   *
   * default: `false`
   */
  exact: boolean
  /**
   * When using a string filter this will tell the filter to use case sensitive
   * matching.
   *
   * default: `false`
   */
  caseSensitive: boolean
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
      if (data[0].hasOwnProperty(key)) {
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

@Component({
  selector: 'seam-data-filter-text',
  templateUrl: './data-filter-text.component.html',
  styleUrls: ['./data-filter-text.component.scss'],
  providers: [ DATA_FILTER_TEXT ]
})
export class DataFilterTextComponent implements OnInit, OnDestroy, IDataFilter {

  _control = new FormControl()

  @Input() properties: string[]
  @Input() omitProperties: string[]
  @Input() exact: boolean
  @Input() caseSensitive: boolean

  @Input() placeholder: string
  @Input() iconTpl: TemplateRef<HTMLElement>

  @Input()
  set value(value: string | string[]) {
    const _value = !isNullOrUndefined(value) ? `${value}` : ''
    if (this._control.value !== _value) {
      this._control.setValue(_value)
    }
  }

  constructor() { }

  ngOnInit() { }

  ngOnDestroy() { }

  get options(): ITextFilterOptions {
    return {
      properties: this.properties,
      omitProperties: this.omitProperties,
      exact: this.exact,
      caseSensitive: this.caseSensitive
    }
  }

  public filter<T>(data: T[]): Observable<T[]> {
    return this._control.valueChanges
      .pipe(
        untilDestroyed(this),
        map(v => textDataFilter(data, v, this.options)),
        startWith(textDataFilter(data, this._control.value, this.options)),
      )
  }

}
