import { Directive, inject, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTopBarCompactMenuBtnDetail]',
  exportAs: 'seamTopBarCompactMenuBtnDetail',
})
export class TopBarCompactMenuBtnDetailDirective {
  public readonly template = inject(TemplateRef<any>)
}
