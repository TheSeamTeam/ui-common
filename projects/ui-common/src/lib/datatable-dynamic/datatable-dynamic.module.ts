import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamButtonsModule } from '@lib/ui-common/buttons'
import { TheSeamDataExporterModule } from '@lib/ui-common/data-exporter'
import { TheSeamDataFiltersModule } from '@lib/ui-common/data-filters'
import { TheSeamDatatableModule } from '@lib/ui-common/datatable'
import { TheSeamIconModule } from '@lib/ui-common/icon'
import { TheSeamMenuModule } from '@lib/ui-common/menu'
import { TheSeamSharedModule } from '@lib/ui-common/shared'
import { TheSeamTableCellTypesModule } from '@lib/ui-common/table-cell-types'

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
