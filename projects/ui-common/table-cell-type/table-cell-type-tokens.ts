import { InjectionToken } from '@angular/core'

import { ITableCellTypeManifest, TableCellData } from './table-cell-type-models'

export const TABLE_CELL_TYPE_MANIFEST = new InjectionToken<ITableCellTypeManifest>('TABLE_CELL_TYPE_MANIFEST')

export const TABLE_CELL_DATA = new InjectionToken<TableCellData<any, any>>('TABLE_CELL_DATA')
