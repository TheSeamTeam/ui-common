import { A11yModule } from '@angular/cdk/a11y'
import { OverlayModule } from '@angular/cdk/overlay'
import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { NgxDatatableModule, ScrollbarHelper } from '@marklb/ngx-datatable'
import { ToastrModule } from 'ngx-toastr'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamCheckboxModule } from '@theseam/ui-common/checkbox'
import { TheSeamConfirmDialogModule } from '@theseam/ui-common/confirm-dialog'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamLoadingModule } from '@theseam/ui-common/loading'
import { TheSeamMenuModule } from '@theseam/ui-common/menu'
import { TheSeamPopoverModule } from '@theseam/ui-common/popover'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'
import { TheSeamTableCellTypeModule } from '@theseam/ui-common/table-cell-type'

import { DatatableActionMenuItemComponent } from './datatable-action-menu-item/datatable-action-menu-item.component'
import { DatatableActionMenuComponent } from './datatable-action-menu/datatable-action-menu.component'
import { DatatableColumnPreferencesButtonComponent } from './datatable-column-preferences-button/datatable-column-preferences-button.component' // tslint:disable-line: max-line-length
import { DatatableColumnPreferencesComponent } from './datatable-column-preferences/datatable-column-preferences.component'
import { DatatableColumnComponent } from './datatable-column/datatable-column.component'
import { DatatableExportButtonComponent } from './datatable-export-button/datatable-export-button.component'
import { DatatableFooterTplDirective } from './datatable-footer/datatable-footer-tpl.directive'
import { TheSeamDatatableFooterDirective } from './datatable-footer/datatable-footer.directive'
import { DatatableMenuBarColumnCenterComponent } from './datatable-menu-bar-column-center/datatable-menu-bar-column-center.component'
import { DatatableMenuBarColumnLeftComponent } from './datatable-menu-bar-column-left/datatable-menu-bar-column-left.component'
import { DatatableMenuBarColumnRightComponent } from './datatable-menu-bar-column-right/datatable-menu-bar-column-right.component'
import { DatatableMenuBarRowComponent } from './datatable-menu-bar-row/datatable-menu-bar-row.component'
import { DatatableMenuBarTextComponent } from './datatable-menu-bar-text/datatable-menu-bar-text.component'
import { DatatableMenuBarComponent } from './datatable-menu-bar/datatable-menu-bar.component'
import { DatatableRowDetailTplDirective } from './datatable-row-detail/datatable-row-detail-tpl.directive'
import { TheSeamDatatableRowDetailDirective } from './datatable-row-detail/datatable-row-detail.directive'
import { DatatableComponent } from './datatable/datatable.component'
import { DatatableActionMenuItemDirective } from './directives/datatable-action-menu-item.directive'
import { DatatableActionMenuToggleDirective } from './directives/datatable-action-menu-toggle.directive'
import { DatatableCellTplDirective } from './directives/datatable-cell-tpl.directive'
import { DatatableFilterDirective } from './directives/datatable-filter.directive'
import { DatatableRowActionItemDirective } from './directives/datatable-row-action-item.directive'
import { TheSeamDatatableScrollbarHelperService } from './services/datatable-scrollbar-helper.service'
import { TheSeamActionMenuModule } from '@theseam/ui-common/action-menu'

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
        DatatableExportButtonComponent,
        TheSeamDatatableRowDetailDirective,
        DatatableRowDetailTplDirective,
        TheSeamDatatableFooterDirective,
        DatatableFooterTplDirective,
        DatatableColumnPreferencesComponent,
        DatatableColumnPreferencesButtonComponent,
        DatatableActionMenuItemDirective,
        DatatableMenuBarRowComponent,
        DatatableMenuBarColumnLeftComponent,
        DatatableMenuBarColumnCenterComponent,
        DatatableMenuBarColumnRightComponent,
        DatatableMenuBarTextComponent,
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
        ToastrModule,
        TheSeamLoadingModule,
        PortalModule,
        TheSeamConfirmDialogModule,
        TheSeamPopoverModule,
        TheSeamCheckboxModule,
        TheSeamFormFieldModule,
        ReactiveFormsModule,
        TheSeamTableCellTypeModule,
        TheSeamActionMenuModule
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
        DatatableExportButtonComponent,
        TheSeamDatatableRowDetailDirective,
        DatatableRowDetailTplDirective,
        TheSeamDatatableFooterDirective,
        DatatableFooterTplDirective,
        DatatableColumnPreferencesComponent,
        DatatableColumnPreferencesButtonComponent,
        DatatableActionMenuItemDirective,
        DatatableMenuBarRowComponent,
        DatatableMenuBarColumnLeftComponent,
        DatatableMenuBarColumnCenterComponent,
        DatatableMenuBarColumnRightComponent,
        DatatableMenuBarTextComponent
    ],
    providers: [
        { provide: ScrollbarHelper, useClass: TheSeamDatatableScrollbarHelperService }
    ]
})
export class TheSeamDatatableModule { }
