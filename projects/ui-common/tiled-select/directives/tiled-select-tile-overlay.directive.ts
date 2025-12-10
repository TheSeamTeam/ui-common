import { Directive, inject, Input, TemplateRef } from '@angular/core'

import { TheSeamTiledSelectItem } from '../tiled-select.models'

@Directive({
  selector: '[seamTiledSelectTileOverlay]',
  exportAs: 'seamTiledSelectTileOverlay',
})
export class TheSeamTiledSelectTileOverlayDirective {
  public readonly template = inject(TemplateRef<any>)

  @Input() record: TheSeamTiledSelectItem | undefined | null
}
