import { InjectionToken } from '@angular/core'

import { TableCellData } from './table-cell.models'

export const TABLE_CELL_DATA = new InjectionToken<TableCellData<any, any>>('TABLE_CELL_DATA')
