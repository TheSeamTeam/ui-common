import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamIconModule } from '../icon/index'
import { TheSeamSharedModule } from '../shared/index'

import { TableCellTypeDateComponent } from './table-cell-type-date/table-cell-type-date.component'
import { TableCellTypeIconComponent } from './table-cell-type-icon/table-cell-type-icon.component'
import { TableCellTypeSelectorComponent } from './table-cell-type-selector.component'
import { TableCellTypeStringComponent } from './table-cell-type-string/table-cell-type-string.component'

import {
  TABLE_CELL_TYPE_MANIFEST_DATE,
  TABLE_CELL_TYPE_MANIFEST_DECIMAL,
  TABLE_CELL_TYPE_MANIFEST_ICON,
  TABLE_CELL_TYPE_MANIFEST_IMAGE,
  TABLE_CELL_TYPE_MANIFEST_INTEGER,
  TABLE_CELL_TYPE_MANIFEST_STRING,
} from './table-cell-type-manifests'

export const cellTypeComponents = [
  TableCellTypeStringComponent,
  TableCellTypeDateComponent,
  TableCellTypeIconComponent
]

export const cellTypeProviders = [
  TABLE_CELL_TYPE_MANIFEST_STRING,
  TABLE_CELL_TYPE_MANIFEST_INTEGER,
  TABLE_CELL_TYPE_MANIFEST_DECIMAL,
  TABLE_CELL_TYPE_MANIFEST_DATE,
  TABLE_CELL_TYPE_MANIFEST_ICON,
  TABLE_CELL_TYPE_MANIFEST_IMAGE
]

@NgModule({
  declarations: [
    ...cellTypeComponents,
    TableCellTypeSelectorComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TheSeamSharedModule,
    TheSeamIconModule,
    PortalModule
  ],
  providers: [
    ...cellTypeProviders
  ],
  exports: [
    ...cellTypeComponents,
    TableCellTypeSelectorComponent,
    PortalModule
  ],
  entryComponents: [
    ...cellTypeComponents
  ]
})
export class TheSeamTableCellTypesModule { }
