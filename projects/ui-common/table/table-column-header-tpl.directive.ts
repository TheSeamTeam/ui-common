import { Directive, inject, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTableColumnHeaderTpl]',
  standalone: true,
})
export class TheSeamTableColumnHeaderTplDirective {
  template = inject(TemplateRef<any>)
}
