import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamDataExporterModule } from '@theseam/ui-common/data-exporter'
import { TheSeamDataFiltersModule } from '@theseam/ui-common/data-filters'
import { TheSeamDatatableModule } from '@theseam/ui-common/datatable'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamMenuModule } from '@theseam/ui-common/menu'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'

import { DatatableDynamicActionMenuComponent } from './datatable-dynamic-action-menu/datatable-dynamic-action-menu.component'
import { DatatableDynamicFilterContainerComponent } from './datatable-dynamic-filter-container/datatable-dynamic-filter-container.component'
import { DatatableDynamicMenuBarContentComponent } from './datatable-dynamic-menu-bar-content/datatable-dynamic-menu-bar-content.component'
import { DatatableDynamicComponent } from './datatable-dynamic.component'
import { DatatableDynamicActionMenuItemDirective } from './directives/datatable-dynamic-action-menu-item.directive'

@NgModule({
  declarations: [
    DatatableDynamicComponent,
    DatatableDynamicFilterContainerComponent,
    DatatableDynamicActionMenuComponent,
    DatatableDynamicActionMenuItemDirective,
    DatatableDynamicMenuBarContentComponent,
  ],
  imports: [
    CommonModule,
    TheSeamSharedModule,
    TheSeamDatatableModule,
    TheSeamTableCellTypesModule,
    TheSeamDataExporterModule,
    TheSeamDataFiltersModule,
    TheSeamIconModule,
    PortalModule,
    RouterModule,
    TheSeamMenuModule,
    TheSeamButtonsModule
  ],
  exports: [
    DatatableDynamicComponent,
    TheSeamDatatableModule,
    DatatableDynamicActionMenuItemDirective
  ]
})
export class TheSeamDatatableDynamicModule { }
