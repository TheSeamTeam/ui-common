import { ComponentType } from '@angular/cdk/portal'
import { SimpleChanges } from '@angular/core'
import { Observable } from 'rxjs'

import { TableColumn } from '@marklb/ngx-datatable'

import { TableCellTypeColumn } from './table-cell-type-column'
import { TableCellTypeConfig } from './table-cell-type-config'
import { TableCellTypeExportProps } from './table-cell-type-export-props'
import { TableCellTypeName } from './table-cell-type-name'

export interface ITableCellTypeManifest {
  /**
   * Name used to reference the cell type. Must be unique to avoid incorrect cell selection.
   */
  name: string
  /**
   * The cell type component.
   *
   * TODO: Add support for lazy loaded cells. This isn't important yet, but
   * later on we may have many unused cell types or a large cell type that isn't
   * used often.
   */
  component: ComponentType<{}> /* | string */ // TODO: Add string for lazy loaded cell support.
}

export interface ICalucatedValueContext<R = any, V = any>
  // TODO: When context usage is better known the Partial should be removed and
  // to clearly define expected values in context.
  extends Partial<TableCellData<any, any, R, V>> {
  [key: string]: any
}

export type CalculatedValueContextFn = () => ICalucatedValueContext

export type CaluclatedValueContextType = ICalucatedValueContext | CalculatedValueContextFn

export type TheSeamTableColumn<T extends TableCellTypeName, C extends TableCellTypeConfig<T> = any> =
  TableColumn &
  TableCellTypeColumn<T, C> &
  TableCellTypeExportProps

export interface TableCellDataChange<T extends TableCellTypeName, C extends TableCellTypeConfig<T>> {
  data: TableCellData<T, C>
  changes: SimpleChanges
}

export interface TableCellData<T extends TableCellTypeName, C extends TableCellTypeConfig<T>, R = any, V = any> {
  row: R
  rowIndex: number
  colData: TheSeamTableColumn<T, C>
  value: V
  changed: Observable<TableCellDataChange<T, C>>
}
