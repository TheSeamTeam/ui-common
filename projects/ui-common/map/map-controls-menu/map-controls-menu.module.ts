import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamIconModule } from '@theseam/ui-common/icon'

// import { TheSeamMapControlModule } from '../map-control/map-control.module'
import { TheSeamMapControlsMenuComponent } from './map-controls-menu.component'

@NgModule({
  declarations: [
    TheSeamMapControlsMenuComponent,
  ],
  imports: [
    CommonModule,
    TheSeamIconModule,
    // TheSeamMapControlModule,
    PortalModule,
  ],
  exports: [
    TheSeamMapControlsMenuComponent,
    // TheSeamMapControlModule,
  ]
})
export class TheSeamMapControlsMenuModule { }
