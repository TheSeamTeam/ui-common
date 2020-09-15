import { TableColumn } from '@marklb/ngx-datatable'

import { TableCellTypeColumn } from '../table-cell-types/table-cell-type-column'
import { TableCellTypeConfig } from '../table-cell-types/table-cell-type-config'
import { TableCellTypeExportProps } from '../table-cell-types/table-cell-type-export-props'
import { TableCellTypeName } from '../table-cell-types/table-cell-type-name'

export type TheSeamTableColumn<T extends TableCellTypeName, C extends TableCellTypeConfig<T> = any> =
  TableColumn &
  TableCellTypeColumn<T, C> &
  TableCellTypeExportProps
