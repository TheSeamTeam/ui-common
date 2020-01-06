import { IDynamicDatatableRow } from '../datatable-dynamic-def'
import { IDynamicDatatableRowAction } from '../models/dynamic-datatable-row-action'

export type DynamicDatatableActionMenuElementTypes = 'a' | 'button'

export interface IDynamicDatatableActionMenuRecord {

  /** Row input. */
  _row: IDynamicDatatableRow

  /** Def input. */
  _def: IDynamicDatatableRowAction

  /**
   * Row action.
   */
  rowAction: IDynamicDatatableRowAction

  /**
   * Expected html element type to be used.
   */
  elementType: DynamicDatatableActionMenuElementTypes
}
