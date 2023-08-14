import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamCarouselSlide]',
})
export class TheSeamCarouselSlideDirective {

  constructor(public readonly template: TemplateRef<any>) { }

}
