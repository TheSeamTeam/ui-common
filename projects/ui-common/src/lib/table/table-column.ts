import { TableColumn } from '@marklb/ngx-datatable'

import { TableCellTypeColumn, TableCellTypeConfig, TableCellTypeExportProps, TableCellTypeName } from '@lib/ui-common/table-cell-type'

export type TheSeamTableColumn<T extends TableCellTypeName, C extends TableCellTypeConfig<T> = any> =
  TableColumn &
  TableCellTypeColumn<T, C> &
  TableCellTypeExportProps
