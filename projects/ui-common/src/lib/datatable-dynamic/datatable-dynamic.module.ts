import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamButtonsModule } from '@lib/ui-common/buttons'
import { TheSeamDataExporterModule } from '@lib/ui-common/data-exporter'
import { TheSeamDataFiltersModule } from '../data-filters/index'
import { TheSeamDatatableModule } from '../datatable/index'
import { TheSeamIconModule } from '../icon/index'
import { TheSeamMenuModule } from '../menu/index'
import { TheSeamSharedModule } from '../shared/index'

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
