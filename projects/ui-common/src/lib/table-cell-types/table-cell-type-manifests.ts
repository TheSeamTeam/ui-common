import { ITableCellTypeManifestProvider } from './table-cell-type-manifest-provider'
import { TABLE_CELL_TYPE_MANIFEST } from './table-cell-types-tokens'

import { TableCellTypeDateComponent } from './table-cell-type-date/table-cell-type-date.component'
import { TableCellTypeIconComponent } from './table-cell-type-icon/table-cell-type-icon.component'
import { TableCellTypePhoneComponent } from './table-cell-type-phone/table-cell-type-phone.component'
// tslint:disable-next-line: max-line-length
import { TableCellTypeProgressCircleIconComponent } from './table-cell-type-progress-circle-icon/table-cell-type-progress-circle-icon.component'
import { TableCellTypeProgressCircleComponent } from './table-cell-type-progress-circle/table-cell-type-progress-circle.component'
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

export const TABLE_CELL_TYPE_MANIFEST_PROGRESS_CIRCLE: ITableCellTypeManifestProvider = {
  provide: TABLE_CELL_TYPE_MANIFEST,
  useValue: {
    name: 'progress-circle',
    component: TableCellTypeProgressCircleComponent
  },
  multi: true
}

export const TABLE_CELL_TYPE_MANIFEST_PROGRESS_CIRCLE_ICON: ITableCellTypeManifestProvider = {
  provide: TABLE_CELL_TYPE_MANIFEST,
  useValue: {
    name: 'progress-circle-icon',
    component: TableCellTypeProgressCircleIconComponent
  },
  multi: true
}

export const TABLE_CELL_TYPE_MANIFEST_PHONE: ITableCellTypeManifestProvider = {
  provide: TABLE_CELL_TYPE_MANIFEST,
  useValue: {
    name: 'phone',
    component: TableCellTypePhoneComponent
  },
  multi: true
}
