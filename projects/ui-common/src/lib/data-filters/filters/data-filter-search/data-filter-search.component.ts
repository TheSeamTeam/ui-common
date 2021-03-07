import { ChangeDetectionStrategy, Component, forwardRef, Inject, Input, OnDestroy, OnInit, Optional, TemplateRef } from '@angular/core'
import { FormControl } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { faSearch } from '@fortawesome/free-solid-svg-icons'

import { DatatableMenuBarComponent } from '@lib/ui-common/datatable'
import type { SeamIcon } from '@lib/ui-common/icon'
import { isNullOrUndefined } from '@lib/ui-common/utils'

import { DataFilterState, IDataFilter, THESEAM_DATA_FILTER, THESEAM_DATA_FILTER_OPTIONS } from '../../data-filter'
import { textDataFilter } from '../data-filter-text/data-filter-text.component'

import { ISearchFilterOptions } from './search-filter-options'


export const DATA_FILTER_SEARCH: any = {
  provide: THESEAM_DATA_FILTER,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DataFilterSearchComponent),
  multi: true,
}

export const DefaultSearchFilterOptions: ISearchFilterOptions = {
  properties: undefined,
  omitProperties: undefined,
  exact: false,
  caseSensitive: false
}

export function searchDataFilter(data: any[], values: string, options = DefaultSearchFilterOptions) {
  return textDataFilter(data, values, options)
}

let _uid = 0

@Component({
  selector: 'seam-data-filter-search',
  templateUrl: './data-filter-search.component.html',
  styleUrls: ['./data-filter-search.component.scss'],
  providers: [ DATA_FILTER_SEARCH ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataFilterSearchComponent implements OnInit, OnDestroy, IDataFilter {

  public readonly name = 'search'
  public readonly uid = `search__${_uid++}`

  _control = new FormControl()

  @Input() properties = this._optDefault('properties')
  @Input() omitProperties = this._optDefault('omitProperties')
  @Input() exact = this._optDefault('exact')
  @Input() caseSensitive = this._optDefault('caseSensitive')

  @Input() placeholder = 'Search...'
  @Input() icon: SeamIcon = faSearch
  @Input() iconTpl: TemplateRef<HTMLElement>

  @Input()
  set value(value: string | string[]) {
    const _value = !isNullOrUndefined(value) ? `${value}` : ''
    if (this._control.value !== _value) {
      this._control.setValue(_value)
    }
  }

  public readonly filterStateChanges: Observable<DataFilterState>

  constructor(
    private _menuBar: DatatableMenuBarComponent,
    @Optional() @Inject(THESEAM_DATA_FILTER_OPTIONS) private _filterOptions: ISearchFilterOptions | null
  ) {
    this.filterStateChanges = this._control.valueChanges.pipe(
      switchMap(() => of(this.filterState())),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  ngOnInit() { this._menuBar.addFilter(this) }

  ngOnDestroy() { this._menuBar.removeFilter(this) }

  private _optDefault<K extends keyof ISearchFilterOptions>(prop: K) {
    if (this._filterOptions && this._filterOptions.hasOwnProperty(prop)) {
      return this._filterOptions[prop]
    }
    return DefaultSearchFilterOptions[prop]
  }

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
        map(v => searchDataFilter(data, v, this.options)),
        startWith(searchDataFilter(data, this._control.value, this.options)),
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
