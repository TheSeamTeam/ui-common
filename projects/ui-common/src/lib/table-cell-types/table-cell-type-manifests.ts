import { ITableCellTypeManifestProvider } from './table-cell-type-manifest-provider'
import { TABLE_CELL_TYPE_MANIFEST } from './table-cell-types-tokens'

import { TableCellTypeDateComponent } from './table-cell-type-date/table-cell-type-date.component'
import { TableCellTypeIconComponent } from './table-cell-type-icon/table-cell-type-icon.component'

export const TABLE_CELL_TYPE_MANIFEST_DATE: ITableCellTypeManifestProvider = {
  provide: TABLE_CELL_TYPE_MANIFEST,
  useValue: {
    name: 'date',
    component: TableCellTypeDateComponent
  },
  multi: true
}

export const TABLE_CELL_TYPE_MANIFEST_ICON: ITableCellTypeManifestProvider = {
  provide: TABLE_CELL_TYPE_MANIFEST,
  useValue: {
    name: 'icon',
    component: TableCellTypeIconComponent
  },
  multi: true
}

export const TABLE_CELL_TYPE_MANIFEST_IMAGE: ITableCellTypeManifestProvider = {
  provide: TABLE_CELL_TYPE_MANIFEST,
  useValue: {
    name: 'image',
    component: TableCellTypeIconComponent
  },
  multi: true
}
