import { NgModule } from '@angular/core'

import { ToggleEditDisplayTplDirective } from './toggle-edit-display-tpl.directive'
import { TheSeamToggleEditComponent } from './toggle-edit.component'

@NgModule({
  imports: [ToggleEditDisplayTplDirective, TheSeamToggleEditComponent],
  exports: [ToggleEditDisplayTplDirective, TheSeamToggleEditComponent],
})
export class TheSeamToggleEditModule {}
