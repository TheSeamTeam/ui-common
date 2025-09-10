import { Directive, inject, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamCarouselSlide]',
  exportAs: 'seamCarouselSlide',
})
export class TheSeamCarouselSlideDirective {
  private readonly template = inject(TemplateRef<any>)
}
