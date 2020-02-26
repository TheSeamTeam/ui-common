import { DynamicDatatableRow } from '../datatable-dynamic-def'
import { DynamicDatatableRowAction } from '../models/dynamic-datatable-row-action'

export type DynamicDatatableActionMenuElementTypes = 'a' | 'button'

export interface DynamicDatatableActionMenuRecord {

  /** Row input. */
  _row: DynamicDatatableRow

  /** Def input. */
  _def: DynamicDatatableRowAction

  /**
   * Row action.
   */
  rowAction: DynamicDatatableRowAction

  /**
   * Expected html element type to be used.
   */
  elementType: DynamicDatatableActionMenuElementTypes
}
