import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { OverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'

import { StoryEmptyWithRouteComponent } from './story-empty-with-route.component'
import { StoryModalContainerComponent } from './story-modal-container.component'

@NgModule({
  declarations: [
    StoryEmptyWithRouteComponent,
    StoryModalContainerComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    OverlayScrollbarDirective
  ],
  exports: [
    StoryEmptyWithRouteComponent,
    StoryModalContainerComponent
  ]
})
export class StoryHelperComponentsModule { }
