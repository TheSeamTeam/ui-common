import { Directive, Inject, Optional, Self, TemplateRef } from '@angular/core'

// import { TheSeamMapControlsMenu, THESEAM_MAP_CONTROLS_MENU } from '../map-controls-menu/map-controls-menu'
// import { TheSeamMapControlMenuControlManifest, THESEAM_MAP_CONTROL_MENU_CONTROL_MANIFEST } from '../map-controls-menu/map-controls-menu-control'

@Directive({
  selector: '[seamMapControl]'
})
export class TheSeamMapControlDirective {

  constructor(
    public readonly template: TemplateRef<any>,
    // @Inject(THESEAM_MAP_CONTROL_MENU_CONTROL_MANIFEST) @Self() private readonly _manifest: TheSeamMapControlMenuControlManifest,
    // @Inject(THESEAM_MAP_CONTROLS_MENU) @Optional() private _menu?: TheSeamMapControlsMenu,
  ) {
    console.log('TheSeamMapControlDirective')
  }

  // public get inMenu(): boolean {
  //   return this._menu !== null && this._menu !== undefined
  // }
}
