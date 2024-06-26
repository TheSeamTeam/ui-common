import { Directive, Input, TemplateRef } from '@angular/core'

import { ITiledSelectItem } from '../tiled-select.models'

@Directive({
  selector: '[seamTiledSelectTileOverlay]',
  exportAs: 'seamTiledSelectTileOverlay'
})
export class TiledSelectTileOverlayDirective {

  @Input() record: ITiledSelectItem | undefined | null

  constructor(public template: TemplateRef<any>) { }

}
