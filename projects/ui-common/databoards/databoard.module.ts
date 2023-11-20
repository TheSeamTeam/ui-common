import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DragDropModule } from '@angular/cdk/drag-drop'

import { TheSeamConfirmDialogModule } from '@theseam/ui-common/confirm-dialog'
import { TheSeamDatatableModule } from '@theseam/ui-common/datatable'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'
import { TheSeamActionMenuModule } from '@theseam/ui-common/action-menu'

import { DataboardListComponent } from './databoard-list/databoard-list.component'
import { DataboardBoardComponent } from './databoard-board/databoard-board.component'
import { DataboardCardComponent } from './databoard-card/databoard-card.component'
import { DataboardCardTplDirective } from './directives/databoard-card-tpl.directive'

import { DataboardHeaderTplDirective } from './directives/databoard-header-tpl.directive'
import { DataboardFooterTplDirective } from './directives/databoard-footer-tpl.directive'
import { DataboardEmptyBoardTplDirective } from './directives/databoard-empty-board-tpl.directive'

@NgModule({
  declarations: [
    DataboardListComponent,
    DataboardBoardComponent,
    DataboardCardComponent,
    DataboardCardTplDirective,
    DataboardHeaderTplDirective,
    DataboardFooterTplDirective,
    DataboardEmptyBoardTplDirective
  ],
  imports: [
    CommonModule,
    DragDropModule,
    TheSeamSharedModule,
    TheSeamConfirmDialogModule,
    TheSeamDatatableModule,
    TheSeamActionMenuModule
  ],
  exports: [
    DataboardListComponent,
    DataboardBoardComponent,
    DataboardCardComponent,
    DataboardCardTplDirective,
    DataboardHeaderTplDirective,
    DataboardFooterTplDirective,
    DataboardEmptyBoardTplDirective
  ]
})
export class TheSeamDataboardModule { }
