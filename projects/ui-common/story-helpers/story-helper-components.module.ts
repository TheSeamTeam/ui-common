import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamOverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'

import { StoryEmptyWithRouteComponent } from './story-empty-with-route.component'
import { StoryModalContainerComponent } from './story-modal-container.component'

@NgModule({
  declarations: [StoryEmptyWithRouteComponent],
  imports: [
    CommonModule,
    RouterModule,
    TheSeamOverlayScrollbarDirective,
    StoryModalContainerComponent,
  ],
  exports: [StoryEmptyWithRouteComponent, StoryModalContainerComponent],
})
export class StoryHelperComponentsModule {}
