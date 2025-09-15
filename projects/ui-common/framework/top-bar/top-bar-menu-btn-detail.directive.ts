import { Directive, inject, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTopBarMenuBtnDetail]',
  exportAs: 'seamTopBarMenuBtnDetail',
})
export class TopBarMenuBtnDetailDirective {
  public readonly template = inject(TemplateRef<any>)
}
