import { TheSeamDatatableColumn } from '../models/table-column'

export const ACTION_MENU_COLUMN_PROP = '$$__actionMenu__'

export function createActionMenuColumn(
  cellTemplate: any,
  headerTemplate: any,
  frozenLeft?: boolean,
  frozenRight?: boolean
): TheSeamDatatableColumn {
  return {
    prop: ACTION_MENU_COLUMN_PROP,
    name: '',
    width: 50,
    minWidth: 50,
    maxWidth: 50,
    resizeable: false,
    sortable: false,
    draggable: false,
    // TODO: Fix column auto sizing with fixed column and cell overlay before enabling.
    frozenLeft: frozenLeft,
    frozenRight: frozenRight,
    cellTemplate,
    headerTemplate,
  }
}
