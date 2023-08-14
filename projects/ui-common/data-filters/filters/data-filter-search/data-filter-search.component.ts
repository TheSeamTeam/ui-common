import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, forwardRef, Inject, Input, OnDestroy, OnInit, Optional, TemplateRef } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { faSearch } from '@fortawesome/free-solid-svg-icons'

import { InputBoolean } from '@theseam/ui-common/core'
import type { SeamIcon } from '@theseam/ui-common/icon'
import { isNullOrUndefined } from '@theseam/ui-common/utils'

import { DataFilterState, IDataFilter, THESEAM_DATA_FILTER, THESEAM_DATA_FILTER_OPTIONS } from '../../data-filter'
import { THESEAM_DATA_FILTER_CONTAINER } from '../../data-filter-container'
import type { DataFilterContainer } from '../../data-filter-container'
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
  static ngAcceptInputType_exact: BooleanInput
  static ngAcceptInputType_caseSensitive: BooleanInput

  public readonly name = 'search'
  public readonly uid = `search__${_uid++}`

  _control = new UntypedFormControl()

  @Input() properties: string[] | undefined | null = this._optDefault('properties')
  @Input() omitProperties: string[] | undefined | null = this._optDefault('omitProperties')
  @Input() @InputBoolean() exact: boolean = this._optDefault('exact')
  @Input() @InputBoolean() caseSensitive: boolean = this._optDefault('caseSensitive')

  @Input() placeholder: string | undefined | null = 'Search...'
  @Input() icon: SeamIcon | undefined | null = faSearch
  @Input() iconTpl?: TemplateRef<HTMLElement>

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
    @Optional() @Inject(THESEAM_DATA_FILTER_OPTIONS) private _filterOptions: ISearchFilterOptions | null
  ) {
    this.filterStateChanges = this._control.valueChanges.pipe(
      switchMap(() => of(this.filterState())),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  ngOnInit() { this._filterContainer.addFilter(this) }

  ngOnDestroy() { this._filterContainer.removeFilter(this) }

  private _optDefault<K extends keyof ISearchFilterOptions>(prop: K) {
    if (this._filterOptions && Object.prototype.hasOwnProperty.call(this._filterOptions, prop)) {
      return this._filterOptions[prop]
    }
    return DefaultSearchFilterOptions[prop]
  }

  get options(): ISearchFilterOptions {
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
