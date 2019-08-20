import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTiledSelectTileIconTpl]',
  exportAs: 'seamTiledSelectTileIconTpl'
})
export class TiledSelectTileIconTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
