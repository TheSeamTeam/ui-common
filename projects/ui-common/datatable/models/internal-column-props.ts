import { ACTION_MENU_COLUMN_PROP } from '../utils/create-action-menu-column'
import { CHECKBOX_COLUMN_PROP } from '../utils/create-checkbox-column'
import { getColumnProp } from '../utils/get-column-prop'
import { TheSeamDatatableColumn } from './table-column'

/**
 * Strings used for columns created and managed
 * by the datatable.
 */
export const INTERNAL_COLUMN_PROPS: string[] = [
  ACTION_MENU_COLUMN_PROP,
  CHECKBOX_COLUMN_PROP
]


export function isInternalColumn(column: TheSeamDatatableColumn): boolean {
  return INTERNAL_COLUMN_PROPS.findIndex(p => getColumnProp(column) === p) !== -1
}
