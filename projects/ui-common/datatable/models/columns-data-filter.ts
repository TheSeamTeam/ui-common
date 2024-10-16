import { DataFilter, DataFilterState } from '@theseam/ui-common/data-filters'
import { TheSeamDatatableColumn, TheSeamDatatableColumnFilterableConfig } from './table-column'
import { Observable } from 'rxjs'
import { FormGroup } from '@angular/forms'
import { InjectionToken } from '@angular/core'

export interface ColumnsDataFilterStateState<T = any, O = any> {
  prop?: string
  formValue?: Partial<T>
  options?: O
  [key: string]: any
}

export interface ColumnsDataFilterState<T = any, O = any> extends DataFilterState {
  state: ColumnsDataFilterStateState<T, O>
}

export abstract class ColumnsDataFilter<TInitial = any, TForm = FormGroup, TOptions = any, TConfig extends TheSeamDatatableColumnFilterableConfig = any> implements DataFilter {
  /**
   * Name used when referencing filter by string.
   */
  public abstract readonly name: string

  /**
   * Unique value to prevent a filter being used more than once if it ends up
   * being registered more than once.
   */
  public abstract readonly uid: string

  public abstract readonly form: TForm

  /**
   * Listens for changes in the filter value and emits the current state of the filter.
   */
  public abstract readonly filterStateChanges: Observable<DataFilterState>

  public abstract readonly options: TOptions

  constructor(
    public readonly prop: string,
    public readonly initialValue: TInitial,
    public readonly column: TheSeamDatatableColumn<any, any, TConfig>
  ) {}

  /**
   * Takes rows, filter form value, and an optional config object, and returns filtered rows.
   */
  public abstract dataFilter(data: any[], filterValue: TInitial, options: any): any[]

  /**
   * Listens for changes in the filter value and filters the data based on the conditions set.
   */
  public abstract filter<T>(data: T[]): Observable<T[]>

  /**
   * Returns the current state of the filter.
   */
  public abstract filterState(): ColumnsDataFilterState<TInitial, TOptions>

  /**
   * Returns the form value back to the default.
   */
  public abstract applyFilter(): void

  /**
   * Returns the form value back to the default.
   */
  public abstract clearFilter(): void

  public abstract isDefault(): boolean
}

export const THESEAM_COLUMNS_DATA_FILTER = new InjectionToken<ColumnsDataFilter<any, any>>('ColumnsDataFilter')
