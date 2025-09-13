import { Directive, inject, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTiledSelectTileLabelTpl]',
  exportAs: 'seamTiledSelectTileLabelTpl',
})
export class TheSeamTiledSelectTileLabelTplDirective {
  public readonly template = inject(TemplateRef<any>)
}
