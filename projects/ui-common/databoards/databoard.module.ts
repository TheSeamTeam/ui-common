import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DragDropModule } from '@angular/cdk/drag-drop'

import { TheSeamActionMenuModule } from '@theseam/ui-common/action-menu'
import { TheSeamCheckboxModule } from '@theseam/ui-common/checkbox'
import { TheSeamConfirmDialogModule } from '@theseam/ui-common/confirm-dialog'
import { TheSeamDatatableModule } from '@theseam/ui-common/datatable'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamMenuModule } from '@theseam/ui-common/menu'
import { TheSeamPopoverModule } from '@theseam/ui-common/popover'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'

import { DataboardBoardComponent } from './databoard-board/databoard-board.component'
import { DataboardBoardPreferencesButtonComponent } from './databoard-board-preferences-button/databoard-board-preferences-button.component'
import { DataboardBoardPreferencesComponent } from './databoard-board-preferences/databoard-board-preferences.component'
import { DataboardCardComponent } from './databoard-card/databoard-card.component'
import { DataboardListComponent } from './databoard-list/databoard-list.component'
import { DataboardListExportButtonComponent } from './databoard-list-export-button/databoard-list-export-button.component'

import { DataboardCardTplDirective } from './directives/databoard-card-tpl.directive'
import { DataboardEmptyBoardTplDirective } from './directives/databoard-empty-board-tpl.directive'
import { DataboardFooterTplDirective } from './directives/databoard-footer-tpl.directive'
import { DataboardHeaderTplDirective } from './directives/databoard-header-tpl.directive'
import { ReactiveFormsModule } from '@angular/forms'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { DataboardListSortButtonComponent } from './databoard-list-sort-button/databoard-list-sort-button.component'

const databoardComponents = [
  DataboardBoardComponent,
  DataboardBoardPreferencesButtonComponent,
  DataboardBoardPreferencesComponent,
  DataboardCardComponent,
  DataboardListComponent,
  DataboardListExportButtonComponent,
  DataboardListSortButtonComponent
]

const databoardDirectives = [
  DataboardCardTplDirective,
  DataboardEmptyBoardTplDirective,
  DataboardFooterTplDirective,
  DataboardHeaderTplDirective,
]

@NgModule({
  declarations: [
    ...databoardComponents,
    ...databoardDirectives
  ],
  imports: [
    CommonModule,
    DragDropModule,
    TheSeamSharedModule,
    TheSeamConfirmDialogModule,
    TheSeamDatatableModule,
    TheSeamActionMenuModule,
    TheSeamMenuModule,
    TheSeamIconModule,
    TheSeamPopoverModule,
    TheSeamFormFieldModule,
    TheSeamCheckboxModule,
    ReactiveFormsModule,
    TheSeamButtonsModule
  ],
  exports: [
    ...databoardComponents,
    ...databoardDirectives
  ]
})
export class TheSeamDataboardModule { }
