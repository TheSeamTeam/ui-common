import { ITableCellTypeManifestProvider } from './table-cell-type-manifest-provider'
import { TABLE_CELL_TYPE_MANIFEST } from './table-cell-types-tokens'

import { TableCellTypeDateComponent } from './table-cell-type-date/table-cell-type-date.component'
import { TableCellTypeIconComponent } from './table-cell-type-icon/table-cell-type-icon.component'
import { TableCellTypeStringComponent } from './table-cell-type-string/table-cell-type-string.component'

export const TABLE_CELL_TYPE_MANIFEST_STRING: ITableCellTypeManifestProvider = {
  provide: TABLE_CELL_TYPE_MANIFEST,
  useValue: {
    name: 'string',
    component: TableCellTypeStringComponent
  },
  multi: true
}

export const TABLE_CELL_TYPE_MANIFEST_INTEGER: ITableCellTypeManifestProvider = {
  provide: TABLE_CELL_TYPE_MANIFEST,
  useValue: {
    name: 'integer',
    component: TableCellTypeStringComponent
  },
  multi: true
}

export const TABLE_CELL_TYPE_MANIFEST_DECIMAL: ITableCellTypeManifestProvider = {
  provide: TABLE_CELL_TYPE_MANIFEST,
  useValue: {
    name: 'decimal',
    component: TableCellTypeStringComponent
  },
  multi: true
}

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
