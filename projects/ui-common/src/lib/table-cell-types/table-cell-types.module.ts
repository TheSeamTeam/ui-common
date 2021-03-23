import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'

import { TheSeamAssetReaderModule } from '@lib/ui-common/asset-reader'
import { TheSeamIconModule } from '@lib/ui-common/icon'
import { TheSeamPopoverModule } from '@lib/ui-common/popover'
import { TheSeamProgressModule } from '@lib/ui-common/progress'
import { TheSeamSharedModule } from '@lib/ui-common/shared'
import { TheSeamTableCellTypeModule } from '@lib/ui-common/table-cell-type'
import { TheSeamTelInputModule } from '@lib/ui-common/tel-input'

import { TableCellTypeDateComponent } from './table-cell-type-date/table-cell-type-date.component'
import { TableCellTypeIconComponent } from './table-cell-type-icon/table-cell-type-icon.component'
import { TableCellTypePhoneComponent } from './table-cell-type-phone/table-cell-type-phone.component'
// tslint:disable-next-line: max-line-length
import { TableCellTypeProgressCircleIconComponent } from './table-cell-type-progress-circle-icon/table-cell-type-progress-circle-icon.component'
import { TableCellTypeProgressCircleComponent } from './table-cell-type-progress-circle/table-cell-type-progress-circle.component'
import { TableCellTypeStringComponent } from './table-cell-type-string/table-cell-type-string.component'

import {
  TABLE_CELL_TYPE_MANIFEST_DATE,
  TABLE_CELL_TYPE_MANIFEST_DECIMAL,
  TABLE_CELL_TYPE_MANIFEST_ICON,
  TABLE_CELL_TYPE_MANIFEST_IMAGE,
  TABLE_CELL_TYPE_MANIFEST_INTEGER,
  TABLE_CELL_TYPE_MANIFEST_PHONE,
  TABLE_CELL_TYPE_MANIFEST_PROGRESS_CIRCLE,
  TABLE_CELL_TYPE_MANIFEST_PROGRESS_CIRCLE_ICON,
  TABLE_CELL_TYPE_MANIFEST_STRING
} from './table-cell-type-manifests'

const cellTypeComponents = [
  TableCellTypeStringComponent,
  TableCellTypeDateComponent,
  TableCellTypeIconComponent,
  TableCellTypeProgressCircleComponent,
  TableCellTypeProgressCircleIconComponent,
  TableCellTypePhoneComponent
]

const cellTypeProviders = [
  TABLE_CELL_TYPE_MANIFEST_STRING,
  TABLE_CELL_TYPE_MANIFEST_INTEGER,
  TABLE_CELL_TYPE_MANIFEST_DECIMAL,
  TABLE_CELL_TYPE_MANIFEST_DATE,
  TABLE_CELL_TYPE_MANIFEST_ICON,
  TABLE_CELL_TYPE_MANIFEST_IMAGE,
  TABLE_CELL_TYPE_MANIFEST_PROGRESS_CIRCLE,
  TABLE_CELL_TYPE_MANIFEST_PROGRESS_CIRCLE_ICON,
  TABLE_CELL_TYPE_MANIFEST_PHONE
]

@NgModule({
  declarations: [
    ...cellTypeComponents
  ],
  imports: [
    CommonModule,
    NgbTooltipModule,
    RouterModule,
    TheSeamSharedModule,
    TheSeamIconModule,
    PortalModule,
    TheSeamPopoverModule,
    TheSeamProgressModule,
    TheSeamTelInputModule,
    TheSeamAssetReaderModule,
    TheSeamTableCellTypeModule
  ],
  providers: [
    ...cellTypeProviders
  ],
  exports: [
    ...cellTypeComponents
  ],
  entryComponents: [
    ...cellTypeComponents
  ]
})
export class TheSeamTableCellTypesModule { }
