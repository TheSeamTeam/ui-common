import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { StoryEmptyWithRouteComponent } from './story-empty-with-route.component'
import { StoryEmptyComponent } from './story-empty.component'
import { StoryModalContainerComponent } from './story-modal-container.component'

@NgModule({
  declarations: [
    StoryEmptyComponent,
    StoryEmptyWithRouteComponent,
    StoryModalContainerComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    StoryEmptyComponent,
    StoryEmptyWithRouteComponent,
    StoryModalContainerComponent
  ]
})
export class StoryHelperComponentsModule { }
