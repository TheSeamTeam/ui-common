import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { StoryEmptyWithRouteComponent } from './story-empty-with-route.component'
import { StoryEmptyComponent } from './story-empty.component'

@NgModule({
  declarations: [
    StoryEmptyComponent,
    StoryEmptyWithRouteComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    StoryEmptyComponent,
    StoryEmptyWithRouteComponent
  ]
})
export class StoryHelperComponentsModule { }
