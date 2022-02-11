import { TheSeamDatatableColumn } from '../models/table-column'

export const CHECKBOX_COLUMN_PROP = '$$__checkbox__'

export function createCheckboxColumn(): TheSeamDatatableColumn {
  return {
    prop: CHECKBOX_COLUMN_PROP,
    name: '',
    width: 40,
    sortable: false,
    canAutoResize: false,
    draggable: false,
    resizeable: false,
    headerCheckboxable: true,
    checkboxable: true,
  }
}
