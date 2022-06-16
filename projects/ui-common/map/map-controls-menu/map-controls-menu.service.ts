import { Inject, Injectable, Optional } from '@angular/core'

import { hasProperty, isNullOrUndefined } from '@theseam/ui-common/utils'

import {
  isMapControlsMenuControlManifest,
  TheSeamMapControlMenuControlInput,
  TheSeamMapControlMenuControlManifest,
  THESEAM_MAP_CONTROL_MENU_CONTROL_MANIFEST,
} from './map-controls-menu-control'

@Injectable()
export class MapControlsMenuService {

  constructor(
    @Optional() @Inject(THESEAM_MAP_CONTROL_MENU_CONTROL_MANIFEST)
    private readonly _controlsManifests?: TheSeamMapControlMenuControlManifest[],
  ) { }

  public parseMenuControlInput(input: TheSeamMapControlMenuControlInput): TheSeamMapControlMenuControlManifest {
    const manifest = this.getMenuControlManifest(input)
    if (manifest !== undefined) {
      return manifest
    }

    if (!isMapControlsMenuControlManifest(manifest)) {
      throw Error(`input '${manifest}' is not a TheSeamMapControlMenuControlManifest`)
    }

    return manifest
  }

  public getMenuControlManifest(value: TheSeamMapControlMenuControlInput): TheSeamMapControlMenuControlManifest | undefined {
    return (this._controlsManifests || []).find(x => x.component === value || x.name === value)
  }
}
