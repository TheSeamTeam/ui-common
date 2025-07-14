import { Inject, Injectable, Optional } from '@angular/core'
import { BehaviorSubject, combineLatest, map, of, switchMap } from 'rxjs'

import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'

import { TheSeamDatatableColumn } from '../models/table-column'
import { camelCase } from '@marklb/ngx-datatable'
import { ColumnsDataFilter, THESEAM_COLUMNS_DATA_FILTER } from '../models/columns-data-filter'
import { TheSeamDatatableColumnFilterDirective } from '../directives/datatable-column-filter.directive'
import { THESEAM_COLUMNS_DATA_FILTERS_DEFAULT } from '../models/columns-data-filters/utils'
import { THESEAM_COLUMNS_DATA_FILTER_DATE_SEARCH_NAME, THESEAM_COLUMNS_DATA_FILTER_NUMERIC_SEARCH_NAME, THESEAM_COLUMNS_DATA_FILTER_TEXT_SEARCH_NAME } from '../models/columns-data-filters/models'

@Injectable()
export class ColumnsFiltersService {
  private readonly _columnFilterTemplates = new BehaviorSubject<TheSeamDatatableColumnFilterDirective[]>([])
  public readonly columnFilterTemplates$ = this._columnFilterTemplates.asObservable()

  private readonly _columns = new BehaviorSubject<TheSeamDatatableColumn[]>([])

  public readonly columnsFilters$ = this._columns.pipe(
    map(columns => columns
      .map(col => (col as any).$$filter)
      .filter(notNullOrUndefined)
    )
  )

  public readonly columnActiveFilterProps$ = this.columnsFilters$.pipe(
    switchMap(filters => {
      if (!filters.length) {
        return of([])
      }

      return combineLatest(filters.map(f => f.filterStateChanges.pipe(
        map((filterState: any) => !f.isDefault() ? filterState.state.prop : null)
      )))
    }),
    map(props => props.filter(notNullOrUndefined))
  )

  constructor(
    @Optional() @Inject(THESEAM_COLUMNS_DATA_FILTER) private readonly _customColumnsDataFilters?: { name: string, class: any }[]
  ) {}

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

  private _getColumnsDataFilter(prop: string, column: TheSeamDatatableColumn, initialValue: any): ColumnsDataFilter | null {
    const filterClass = this._getColumnsDataFilterType(column)

    let filter
    if (notNullOrUndefined(this._customColumnsDataFilters)) {
      filter = this._customColumnsDataFilters.find(x => x.name === filterClass)
    }

    if (isNullOrUndefined(filter)) {
      filter = THESEAM_COLUMNS_DATA_FILTERS_DEFAULT.find(x => x.name === filterClass)
    }

    if (notNullOrUndefined(filter)) {
      // eslint-disable-next-line new-cap
      return new filter.class(prop, initialValue, column)
    }

    return null
  }

  private _getColumnsDataFilterType(column: TheSeamDatatableColumn): string {
    if (notNullOrUndefined(column.filterOptions) && notNullOrUndefined(column.filterOptions.filterType)) {
      return column.filterOptions.filterType
    } else if (notNullOrUndefined(column.cellType)) {
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

    const prop = column.filterOptions?.filterProp || column.prop || (notNullOrUndefined(column.name) ? camelCase(column.name as string) : undefined)
    if (isNullOrUndefined(prop)) {
      return null
    }

    return `${prop}`
  }

  public setColumns(columns: TheSeamDatatableColumn[]) {
    this._columns.next(columns)
  }

  public getColumnFilter(prop: string | null): ColumnsDataFilter | undefined {
    if (isNullOrUndefined(prop)) {
      return undefined
    }

    const columns = this._columns.value
    const column = columns.find(col => this.getColumnFilterProp(col) === prop)
    return column ? (column as any).$$filter : undefined
  }

  public filters(): ColumnsDataFilter[] {
    return this._columns.value
      .map(col => (col as any).$$filter)
      .filter(notNullOrUndefined)
  }

  public addFilter(filter: ColumnsDataFilter) {
    // Filters are now managed through columns, so this method is deprecated
    console.warn('ColumnsFiltersService.addFilter is deprecated - filters are now managed through columns')
  }

  public removeFilter(filter: ColumnsDataFilter) {
    // Filters are now managed through columns, so this method is deprecated
    console.warn('ColumnsFiltersService.removeFilter is deprecated - filters are now managed through columns')
  }
}
