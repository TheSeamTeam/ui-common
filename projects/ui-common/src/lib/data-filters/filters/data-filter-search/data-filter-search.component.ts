import { ChangeDetectionStrategy, Component, forwardRef, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core'
import { FormControl } from '@angular/forms'
import { untilDestroyed } from 'ngx-take-until-destroy'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

import { LibIcon } from '../../../icon/index'
import { isNullOrUndefined } from '../../../utils/index'

import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { IDataFilter, THESEAM_DATA_FILTER } from '../../data-filter'
import { ITextFilterOptions, textDataFilter } from '../data-filter-text/data-filter-text.component'


export const DATA_FILTER_SEARCH: any = {
  provide: THESEAM_DATA_FILTER,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DataFilterSearchComponent),
  multi: true,
}

export type ISearchFilterOptions = ITextFilterOptions

export const DefaultSearchFilterOptions: ISearchFilterOptions = {
  properties: undefined,
  omitProperties: undefined,
  exact: false,
  caseSensitive: false
}

export function searchDataFilter(data: any[], values: string, options = DefaultSearchFilterOptions) {
  return textDataFilter(data, values, options)
}

@Component({
  selector: 'seam-data-filter-search',
  templateUrl: './data-filter-search.component.html',
  styleUrls: ['./data-filter-search.component.scss'],
  providers: [ DATA_FILTER_SEARCH ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataFilterSearchComponent implements OnInit, OnDestroy, IDataFilter {

  public readonly name = 'search'

  _control = new FormControl()

  @Input() properties: string[]
  @Input() omitProperties: string[]
  @Input() exact: boolean
  @Input() caseSensitive: boolean

  @Input() placeholder = 'Search...'
  @Input() icon: LibIcon = faSearch
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

  get options(): ISearchFilterOptions {
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
        map(v => searchDataFilter(data, v, this.options)),
        startWith(searchDataFilter(data, this._control.value, this.options)),
      )
  }

}
