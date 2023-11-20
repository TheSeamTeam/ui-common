import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { TheSeamDataboardModule } from '@theseam/ui-common/databoards'
import { TheSeamDatatableModule } from '@theseam/ui-common/datatable'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'
import { TheSeamToggleGroupModule } from '@theseam/ui-common/toggle-group'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamActionMenuModule } from '@theseam/ui-common/action-menu'

import { DatapageComponent } from './datapage/datapage.component'
import { DatapageDataboardTplDirective } from './directives/datapage-databoard-tpl.directive'
import { DatapageDatatableTplDirective } from './directives/datapage-datatable-tpl.directive'
import { DatapageDefaultTplDirective } from './directives/datapage-default-tpl.directive'

@NgModule({
  declarations: [
    DatapageComponent,
    DatapageDataboardTplDirective,
    DatapageDatatableTplDirective,
    DatapageDefaultTplDirective
  ],
  imports: [
    CommonModule,
    TheSeamSharedModule,
    TheSeamDatatableModule,
    TheSeamDataboardModule,
    TheSeamToggleGroupModule,
    TheSeamButtonsModule,
    TheSeamIconModule,
    TheSeamActionMenuModule
  ],
  exports: [
    DatapageComponent,
    DatapageDataboardTplDirective,
    DatapageDatatableTplDirective,
    DatapageDefaultTplDirective
  ]
})
export class TheSeamDatapageModule { }
