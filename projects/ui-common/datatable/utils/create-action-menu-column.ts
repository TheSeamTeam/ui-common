import { TheSeamDatatableColumn } from '../models/table-column'

export function createActionMenuColumn(
  cellTemplate: any,
  headerTemplate: any
): TheSeamDatatableColumn {
  return {
    prop: '$$__actionMenu__',
    name: '',
    width: 50,
    minWidth: 50,
    maxWidth: 50,
    resizeable: false,
    sortable: false,
    draggable: false,
    // TODO: Fix column auto sizing with fixed column and cell overlay before enabling.
    // frozenRight: true,
    cellTemplate,
    headerTemplate,
  }
}
