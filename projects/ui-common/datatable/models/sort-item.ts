import { TheSeamDatatableColumn } from './table-column'

export type SortItem = Partial<TheSeamDatatableColumn> & Required<Pick<TheSeamDatatableColumn, 'prop'>>
