import { TheSeamDatatableColumn } from '../models/table-column'

export function createCheckboxColumn(): TheSeamDatatableColumn {
  return {
    prop: '$$__checkbox__',
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

