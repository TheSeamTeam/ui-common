import { NgModule } from '@angular/core'

import { TheSeamCarouselSlideDirective } from './carousel-slide.directive'
import { TheSeamCarouselComponent } from './carousel.component'

@NgModule({
  imports: [TheSeamCarouselComponent, TheSeamCarouselSlideDirective],
  exports: [TheSeamCarouselComponent, TheSeamCarouselSlideDirective],
})
export class TheSeamCarouselModule {}
