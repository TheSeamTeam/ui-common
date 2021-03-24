import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamTiledSelectTileLabelTpl]'
})
export class TiledSelectTileLabelTplDirective {

  constructor(public template: TemplateRef<any>) { }

}
