import { Directive, inject, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamToggleEditDisplayTpl]',
  exportAs: 'seamToggleEditDisplayTpl',
})
export class ToggleEditDisplayTplDirective {
  public readonly template = inject(TemplateRef<any>)
}
