import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { ToggleGroupOptionDirective } from './toggle-group-option.directive'
import { ToggleGroupDirective } from './toggle-group.directive'

@NgModule({
  declarations: [
    ToggleGroupDirective,
    ToggleGroupOptionDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    ToggleGroupDirective,
    ToggleGroupOptionDirective
  ]
})
export class TheSeamToggleGroupModule { }
