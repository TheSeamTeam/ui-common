import { ObserversModule } from '@angular/cdk/observers'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamCheckboxComponent } from './checkbox.component'

/** @deprecated */
@NgModule({
  imports: [
    TheSeamCheckboxComponent
  ],
  exports: [
    TheSeamCheckboxComponent
  ]
})
export class TheSeamCheckboxModule { }
