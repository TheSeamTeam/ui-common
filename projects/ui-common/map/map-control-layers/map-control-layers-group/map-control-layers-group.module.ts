import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { TheSeamMapControlLayersGroupComponent } from './map-control-layers-group.component'

@NgModule({
  declarations: [
    TheSeamMapControlLayersGroupComponent,
  ],
  imports: [
    CommonModule,
    TheSeamIconModule,
    TheSeamButtonsModule,
  ],
  exports: [
    TheSeamMapControlLayersGroupComponent,
  ]
})
export class TheSeamMapControlLayersGroupModule { }
