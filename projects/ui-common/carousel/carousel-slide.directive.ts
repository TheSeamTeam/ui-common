import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamCarouselSlide]'
})
export class CarouselSlideDirective {

  constructor(public template: TemplateRef<any>) { }

}
