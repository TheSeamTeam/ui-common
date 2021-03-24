import { ComponentType } from '@angular/cdk/portal'
import { SimpleChanges } from '@angular/core'
import { Observable } from 'rxjs'

import { TheSeamTableColumn } from '@theseam/ui-common/table'
import { TableCellTypeConfig, TableCellTypeName } from '@theseam/ui-common/table-cell-type'

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
