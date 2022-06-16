import { AgmMap } from '@agm/core'
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewContainerRef,
} from '@angular/core'
import { TheSeamMapControlDirective } from './map-control/map-control.directive'
import { MapControlsService, MAP_CONTROLS_SERVICE } from './map-controls-service'

import {
  CanDisable,
  CanDisableCtor,
  HasTabIndex,
  HasTabIndexCtor,
  InputBoolean,
  InputNumber,
  mixinDisabled,
  mixinTabIndex,
} from '@theseam/ui-common/core'

import { MapManagerService } from './map-manager.service'

class TheSeamMapComponentBase {
  constructor(public _elementRef: ElementRef) {}
}

const _TheSeamMapMixinBase: HasTabIndexCtor & CanDisableCtor &
  typeof TheSeamMapComponentBase =
    mixinTabIndex(mixinDisabled(TheSeamMapComponentBase))

/**
 * A map.
 */
@Component({
  selector: 'seam-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  exportAs: 'seamMap',
  host: {
    '[attr.tabindex]': 'null',
  },
  providers: [
    MapManagerService
  ],
  inputs: [ 'tabIndex' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamMapComponent extends _TheSeamMapMixinBase
  implements OnInit, AfterViewInit, OnDestroy, CanDisable, HasTabIndex {

    // @ContentChild(TheSeamMapControlDirective, { static: true })
    @ContentChildren(TheSeamMapControlDirective)
  set _controlsTpls(value: QueryList<TheSeamMapControlDirective>) {
    console.log('_controlsTpls', value)
    // if (value) {
    //   // const componentFactory = this._componentFactoryResolver.resolveComponentFactory(portal.component)
    //   // let viewRef = this._vcr.createEmbeddedView(value.templateRef, value.context)
    //   const viewRef = this._vcr.createEmbeddedView(value.template, {})
    //   // viewRef.rootNodes.forEach(rootNode => this.outletElement.appendChild(rootNode));
    //   viewRef.rootNodes[0].parentElement.removeChild(viewRef.rootNodes[0])
    //   this._mapsControls.addPolygonEditorControls(viewRef.rootNodes[0])

    //   // Note that we want to detect changes after the nodes have been moved so that
    //   // any directives inside the portal that are looking at the DOM inside a lifecycle
    //   // hook won't be invoked too early.
    //   viewRef.detectChanges()
    // }
    this._mapManager.setRegisteredControlDirectives(value.toArray())
  }

  constructor(
    elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _focusMonitor: FocusMonitor,
    private _ngZone: NgZone,
    private readonly _vcr: ViewContainerRef,
    private readonly _componentFactoryResolver: ComponentFactoryResolver,
    private readonly _mapManager: MapManagerService,
    // @Inject(MAP_CONTROLS_SERVICE) private readonly _mapsControls: MapControlsService,
    @Attribute('tabindex') tabIndex: string
  ) {
    super(elementRef)

    this.tabIndex = parseInt(tabIndex, 10) || 0
  }

  /** @ignore */
  ngOnInit() { }

  /** @ignore */
  ngOnDestroy() { }

  /** @ignore */
  ngAfterViewInit() { }

}
