import { A11yModule } from '@angular/cdk/a11y'
import { OverlayModule } from '@angular/cdk/overlay'
import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { NgxDatatableModule, ScrollbarHelper } from '@marklb/ngx-datatable'
import { ToastrModule } from 'ngx-toastr'

import { TheSeamButtonsModule } from '../buttons/buttons.module'
import { TheSeamConfirmDialogModule } from '../confirm-dialog/confirm-dialog.module'
import { TheSeamIconModule } from '../icon/icon.module'
import { TheSeamLoadingModule } from '../loading/loading.module'
import { TheSeamMenuModule } from '../menu/menu.module'
import { TheSeamSharedModule } from '../shared/shared.module'
import { TheSeamTableCellTypesModule } from '../table-cell-types/table-cell-types.module'

import { DatatableActionMenuItemComponent } from './datatable-action-menu-item/datatable-action-menu-item.component'
import { DatatableActionMenuComponent } from './datatable-action-menu/datatable-action-menu.component'
import { DatatableColumnComponent } from './datatable-column/datatable-column.component'
import { DatatableExportButtonComponent } from './datatable-export-button/datatable-export-button.component'
import { DatatableMenuBarComponent } from './datatable-menu-bar/datatable-menu-bar.component'
import { DatatableComponent } from './datatable/datatable.component'
import { DatatableActionMenuToggleDirective } from './directives/datatable-action-menu-toggle.directive'
import { DatatableCellTplDirective } from './directives/datatable-cell-tpl.directive'
import { DatatableFilterDirective } from './directives/datatable-filter.directive'
import { DatatableRowActionItemDirective } from './directives/datatable-row-action-item.directive'
import { TheSeamDatatableScrollbarHelperService } from './services/datatable-scrollbar-helper.service'


@NgModule({
  declarations: [
    DatatableComponent,
    DatatableCellTplDirective,
    DatatableColumnComponent,
    DatatableActionMenuComponent,
    DatatableActionMenuToggleDirective,
    DatatableActionMenuItemComponent,
    DatatableMenuBarComponent,
    DatatableFilterDirective,
    DatatableRowActionItemDirective,
    DatatableExportButtonComponent
  ],
  imports: [
    CommonModule,
    NgxDatatableModule,
    FontAwesomeModule,
    OverlayModule,
    A11yModule,
    TheSeamSharedModule,
    RouterModule,
    TheSeamMenuModule,
    TheSeamButtonsModule,
    TheSeamIconModule,
    ToastrModule.forRoot(),
    TheSeamLoadingModule,
    PortalModule,
    TheSeamConfirmDialogModule,
    TheSeamTableCellTypesModule
  ],
  exports: [
    DatatableComponent,
    DatatableCellTplDirective,
    DatatableColumnComponent,
    DatatableActionMenuComponent,
    DatatableActionMenuItemComponent,
    DatatableMenuBarComponent,
    DatatableFilterDirective,
    DatatableRowActionItemDirective,
    DatatableExportButtonComponent
  ],
  providers: [
    { provide: ScrollbarHelper, useClass: TheSeamDatatableScrollbarHelperService }
  ]
})
export class TheSeamDatatableModule { }
