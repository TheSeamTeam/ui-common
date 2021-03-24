import { ObserversModule } from '@angular/cdk/observers'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamCheckboxComponent } from './checkbox.component'

@NgModule({
  declarations: [
    TheSeamCheckboxComponent
  ],
  imports: [
    CommonModule,
    ObserversModule
  ],
  exports: [
    TheSeamCheckboxComponent
  ]
})
export class TheSeamCheckboxModule { }
