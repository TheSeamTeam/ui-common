import { Directive, inject, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTiledSelectTileIconTpl]',
  exportAs: 'seamTiledSelectTileIconTpl',
})
export class TheSeamTiledSelectTileIconTplDirective {
  public readonly template = inject(TemplateRef<any>)
}
