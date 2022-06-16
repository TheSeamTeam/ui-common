import { BooleanInput } from '@angular/cdk/coercion'
import { ComponentPortal } from '@angular/cdk/portal'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core'

import { CanDisable, CanDisableCtor, mixinDisabled } from '@theseam/ui-common/core'
import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'

import { TheSeamMapControlDirective } from '../map-control/map-control.directive'
import { getManifestOrder, TheSeamMapControlMenuControlIdentifierInput, TheSeamMapControlMenuControlInput, TheSeamMapControlMenuControlManifest } from './map-controls-menu-control'
import { MapControlsMenuService } from './map-controls-menu.service'

class TheSeamMapControlsMenuComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamMapControlsMenuMixinBase: CanDisableCtor &
  typeof TheSeamMapControlsMenuComponentBase =
    mixinDisabled(TheSeamMapControlsMenuComponentBase)

/**
 *
 */
@Component({
  selector: 'seam-map-controls-menu',
  templateUrl: './map-controls-menu.component.html',
  styleUrls: ['./map-controls-menu.component.scss'],
  providers: [
    MapControlsMenuService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamMapControlsMenuComponent extends _TheSeamMapControlsMenuMixinBase
  implements OnInit, AfterViewInit, OnDestroy, CanDisable {
  static ngAcceptInputType_disabled: BooleanInput

  _portal?: ComponentPortal<{}>

  @Input()
  set controls(value: TheSeamMapControlMenuControlInput[] | undefined | null) {
    this._controls = (Array.isArray(value) ? value : [])
      .map(x => this._mapControlsMenuService.parseMenuControlInput(x))
      .filter(notNullOrUndefined)
      .sort((a, b) => getManifestOrder(a) - getManifestOrder(b))

    this._updateActiveControl()
  }
  _controls: TheSeamMapControlMenuControlManifest[] = []

  @Input()
  set activeControl(value: TheSeamMapControlMenuControlIdentifierInput | undefined | null) {
    this._activeControlInput = value
    this._updateActiveControl()
  }
  _activeControlInput: TheSeamMapControlMenuControlIdentifierInput | undefined | null

  _activeControlManifest: TheSeamMapControlMenuControlManifest | undefined

  constructor(
    elementRef: ElementRef,
    private readonly _injector: Injector,
    private readonly _mapControlsMenuService: MapControlsMenuService,
  ) {
    super(elementRef)
  }

  /** @ignore */
  ngOnInit(): void { }

  /** @ignore */
  ngOnDestroy() { }

  /** @ignore */
  ngAfterViewInit() { }

  private setActiveControlManifest(manifest: TheSeamMapControlMenuControlManifest | undefined): void {
    if (this._activeControlManifest === manifest) {
      return
    }

    this._activeControlManifest = manifest
    this._portal = this._createPortal(manifest)
  }

  private _updateActiveControl(): void {
    let manifest: TheSeamMapControlMenuControlManifest | undefined
    if (notNullOrUndefined(this._activeControlInput)) {
      const _manifest = this._mapControlsMenuService.getMenuControlManifest(this._activeControlInput)
      if (notNullOrUndefined(this._activeControlManifest) && _manifest === this._activeControlManifest) {
        return
      }
      manifest = _manifest

      if (isNullOrUndefined(manifest)) {
        throw Error(`activeControl not recognized.`)
      }
    }

    if (notNullOrUndefined(manifest)) {
      this.setActiveControlManifest(manifest)
      return
    }

    if (this._controls.length === 0) {
      this.setActiveControlManifest(undefined)
      return
    }

    this.setActiveControlManifest(this._controls[0])
  }

  private _createPortal(manifest: TheSeamMapControlMenuControlManifest | undefined): ComponentPortal<{}> | undefined {
    if (manifest === undefined) {
      return
    }

    const component = manifest.component
    const injector = Injector.create({
      providers: [],
      parent: this._injector,
    })

    return new ComponentPortal(component, null, injector)
  }
}
