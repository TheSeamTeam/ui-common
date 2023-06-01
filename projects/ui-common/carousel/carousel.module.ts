import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { TheSeamCarouselSlideDirective } from './carousel-slide.directive'
import { TheSeamCarouselComponent } from './carousel.component'

@NgModule({
  declarations: [
    TheSeamCarouselComponent,
    TheSeamCarouselSlideDirective
  ],
  imports: [
    CommonModule,
    TheSeamIconModule,
    TheSeamButtonsModule,
  ],
  exports: [
    TheSeamCarouselComponent,
    TheSeamCarouselSlideDirective
  ],
  providers: []
})
export class TheSeamCarouselModule { }
