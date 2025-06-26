import { Inject, Injectable, Optional } from '@angular/core'
import { BehaviorSubject, combineLatest, map, of, switchMap } from 'rxjs'

import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'

import { TheSeamDatatableColumn } from '../models/table-column'
import { DataFilterContainer } from '@theseam/ui-common/data-filters'
import { camelCase } from '@marklb/ngx-datatable'
import { ColumnsDataFilter, THESEAM_COLUMNS_DATA_FILTER } from '../models/columns-data-filter'
import { TheSeamDatatableColumnFilterDirective } from '../directives/datatable-column-filter.directive'
import { THESEAM_COLUMNS_DATA_FILTERS_DEFAULT } from '../models/columns-data-filters/utils'
import { THESEAM_COLUMNS_DATA_FILTER_DATE_SEARCH_NAME, THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SEARCH_NAME, THESEAM_COLUMNS_DATA_FILTER_TEXT_SEARCH_NAME } from '../models/columns-data-filters/models'

@Injectable()
export class ColumnsFiltersService implements DataFilterContainer {
  private readonly _columnFilterTemplates = new BehaviorSubject<TheSeamDatatableColumnFilterDirective[]>([])
  public readonly columnFilterTemplates$ = this._columnFilterTemplates.asObservable()

  private readonly _columnsFilters = new BehaviorSubject<ColumnsDataFilter[]>([])
  public readonly columnsFilters$ = this._columnsFilters.asObservable()

  public readonly columnActiveFilterProps$ = this.columnsFilters$.pipe(
    switchMap(filters => {
      if (!filters.length) {
        return of([])
      }

      return combineLatest(filters.map(f => f.filterStateChanges.pipe(
        map(filterState => !f.isDefault() ? filterState.state.prop : null)
      )))
    }),
    map(props => props.filter(notNullOrUndefined))
  )

  constructor(
    @Optional() @Inject(THESEAM_COLUMNS_DATA_FILTER) private readonly _customColumnsDataFilters?: { name: string, class: any }[]
  ) {}

  public registerColumnFilters(columns: TheSeamDatatableColumn[]) {
    this._columnsFilters.next([])

    const filters = columns
      .filter(col => col.filterable)
      .map(col => this.createColumnDataFilter(col, null))

    this._columnsFilters.next(filters.filter(notNullOrUndefined))
  }

  public setFilterTemplates(tpls: TheSeamDatatableColumnFilterDirective[]) {
    this._columnFilterTemplates.next(tpls)
  }

  public createColumnDataFilter(column: TheSeamDatatableColumn, initialValue: any): ColumnsDataFilter | null {
    const prop = this.getColumnFilterProp(column)

    if (isNullOrUndefined(prop)) {
      return null
    }

    return this._getColumnsDataFilter(prop, column, initialValue)
  }

  private _getColumnsDataFilter(prop: string, column: TheSeamDatatableColumn, initialValue: any): ColumnsDataFilter | null
  {
    const filterClass = this._getColumnsDataFilterType(column)

    let filter
    if (notNullOrUndefined(this._customColumnsDataFilters)) {
      filter = this._customColumnsDataFilters.find(x => x.name === filterClass)
    }

    if (isNullOrUndefined(filter)) {
      filter = THESEAM_COLUMNS_DATA_FILTERS_DEFAULT.find(x => x.name === filterClass)
    }

    if (notNullOrUndefined(filter)) {
      return new filter.class(prop, initialValue, column)
    }

    return null
  }

  private _getColumnsDataFilterType(column: TheSeamDatatableColumn): string {
    if (notNullOrUndefined(column.filterOptions) && notNullOrUndefined(column.filterOptions.filterType)) {
      return column.filterOptions.filterType
    }
    else if (notNullOrUndefined(column.cellType)) {
      switch (column.cellType) {
        case 'string':
        case 'phone':
          return THESEAM_COLUMNS_DATA_FILTER_TEXT_SEARCH_NAME
        case 'currency':
        case 'decimal':
        case 'integer':
          return THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SEARCH_NAME
        case 'date':
          return THESEAM_COLUMNS_DATA_FILTER_DATE_SEARCH_NAME
      }
    }

    return THESEAM_COLUMNS_DATA_FILTER_TEXT_SEARCH_NAME
  }

  public getColumnFilterProp(column: TheSeamDatatableColumn | null | undefined): string | null {
    if (isNullOrUndefined(column)) {
      return null
    }

    const prop = column.filterOptions?.filterProp || column.prop || (notNullOrUndefined(column.name) ? camelCase(<string>column.name) : undefined)
    if (isNullOrUndefined(prop)) {
      return null
    }

    return `${prop}`
  }

  public getColumnFilter(prop: string | null): ColumnsDataFilter | undefined {
    if (isNullOrUndefined(prop)) {
      return undefined
    }

    return this._columnsFilters.value.find(f => f.prop === prop)
  }

  public filters(): ColumnsDataFilter[] {
    return this._columnsFilters.value
  }

  public addFilter(filter: ColumnsDataFilter) {
    this._columnsFilters.next([ ...this._columnsFilters.value, filter ])
  }

  public removeFilter(filter: ColumnsDataFilter) {
    this._columnsFilters.next([ ...this._columnsFilters.value.filter(c => c.name !== filter.name) ])
  }
}
