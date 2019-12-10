import { ComponentPortal, PortalInjector } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, Injector, Input, OnInit, ViewContainerRef } from '@angular/core'

import { THESEAM_DATA_FILTER_OPTIONS } from '../../data-filters/data-filter'
import { ComponentType } from '../../models/index'

@Component({
  selector: 'seam-datatable-dynamic-filter-container',
  templateUrl: './datatable-dynamic-filter-container.component.html',
  styleUrls: ['./datatable-dynamic-filter-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableDynamicFilterContainerComponent<C> implements OnInit {

  @Input()
  set filterComponent(value: ComponentType<C>) {
    this._filterComponent = value
    // if (this._filterComponent !== value) {
    //   this._setPortal(value)
    // }
  }
  get filterComponent() { return this._filterComponent }
  private _filterComponent: ComponentType<C>

  @Input() options: any

  _portal: ComponentPortal<C> | null = null

  constructor(
    private _injector: Injector
  ) { }

  ngOnInit() {
    this._setPortal(this.filterComponent)
  }

  private _setPortal(component: ComponentType<C>) {
    if (this._portal) {
      this._portal = null
    }

    if (component) {
      this._portal = new ComponentPortal(component, undefined, this._createInjector())
    } else {
      this._portal = null
    }
  }

  private _createInjector(): PortalInjector {
    return new PortalInjector(this._injector, new WeakMap <any, any> ([
      [ THESEAM_DATA_FILTER_OPTIONS, this.options ]
    ]))
  }

}
