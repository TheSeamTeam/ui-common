import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { StoryEmptyComponent } from './story-empty.component'

@NgModule({
  declarations: [
    StoryEmptyComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    StoryEmptyComponent
  ]
})
export class StoryHelperComponentsModule { }
