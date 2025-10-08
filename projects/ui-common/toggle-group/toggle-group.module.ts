import { NgModule } from '@angular/core'

import { ToggleGroupOptionDirective } from './toggle-group-option.directive'
import { ToggleGroupDirective } from './toggle-group.directive'

@NgModule({
  imports: [
    ToggleGroupDirective,
    ToggleGroupOptionDirective,
  ],
  exports: [
    ToggleGroupDirective,
    ToggleGroupOptionDirective,
  ],
})
export class TheSeamToggleGroupModule { }
