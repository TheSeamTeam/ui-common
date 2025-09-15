import { Directive, inject, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTopBarNavToggleBtnDetail]',
  exportAs: 'seamTopBarNavToggleBtnDetail',
})
export class TopBarNavToggleBtnDetailDirective {
  public readonly template = inject(TemplateRef<any>)
}
