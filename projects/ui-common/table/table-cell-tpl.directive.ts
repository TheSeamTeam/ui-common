import { Directive, inject, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTableCellTpl]',
  standalone: true,
})
export class TheSeamTableCellTplDirective {
  template = inject(TemplateRef<any>)
}
