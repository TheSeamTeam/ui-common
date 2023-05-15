import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'

import { TheSeamDynamicComponentLoaderModule } from '@theseam/ui-common/dynamic-component-loader'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { CarouselSlideDirective } from './carousel-slide.directive'

import { TheSeamCarouselComponent } from './carousel.component'

@NgModule({
  declarations: [
    TheSeamCarouselComponent,
    CarouselSlideDirective
  ],
  imports: [
    CommonModule,
    TheSeamIconModule,
    TheSeamButtonsModule,
    TheSeamDynamicComponentLoaderModule.forChild(TheSeamCarouselComponent),
  ],
  exports: [
    TheSeamCarouselComponent,
    CarouselSlideDirective
  ],
  providers: []
})
export class TheSeamCarouselModule { }
