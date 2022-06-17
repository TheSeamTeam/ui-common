import { BooleanInput } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core'

import { faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import { CanDisable, CanDisableCtor, mixinDisabled } from '@theseam/ui-common/core'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { TheSeamMapControlMenuControlInput } from '../map-controls-menu/map-controls-menu-control'
import { MapControlsMenuService } from '../map-controls-menu/map-controls-menu.service'
import { MapControlLayersTilesService } from './map-control-layers-tiles.service'

// import { TheSeamMapControlMenuControlManifest, THESEAM_MAP_CONTROL_MENU_CONTROL_MANIFEST } from '../map-controls-menu/map-controls-menu-control'

class TheSeamMapControlLayersComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamMapControlLayersMixinBase: CanDisableCtor &
  typeof TheSeamMapControlLayersComponentBase =
    mixinDisabled(TheSeamMapControlLayersComponentBase)



/**
 *
 */
@Component({
  selector: 'seam-map-control-layers',
  templateUrl: './map-control-layers.component.html',
  styleUrls: ['./map-control-layers.component.scss'],
  providers: [
    MapControlLayersTilesService,
    // {
    //   provide: THESEAM_MAP_CONTROL_MENU_CONTROL_MANIFEST,
    //   useValue: manifest,
    //   multi: true,
    // }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamMapControlLayersComponent extends _TheSeamMapControlLayersMixinBase
  implements OnInit, AfterViewInit, OnDestroy, CanDisable {
  static ngAcceptInputType_disabled: BooleanInput

  constructor(
    elementRef: ElementRef,
  ) {
    super(elementRef)
    console.log('TheSeamMapControlLayersComponent constructor')
  }

  /** @ignore */
  ngOnInit() { }

  /** @ignore */
  ngOnDestroy() { }

  /** @ignore */
  ngAfterViewInit() { }
}
