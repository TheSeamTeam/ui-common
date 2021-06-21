import { ComponentPortal, PortalInjector } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core'

import { THESEAM_DATA_FILTER_OPTIONS } from '@theseam/ui-common/data-filters'
import type { ComponentType } from '@theseam/ui-common/models'

@Component({
  selector: 'seam-datatable-dynamic-filter-container',
  templateUrl: './datatable-dynamic-filter-container.component.html',
  styleUrls: ['./datatable-dynamic-filter-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableDynamicFilterContainerComponent<C> implements OnInit {

  @Input()
  set filterComponent(value: ComponentType<C> | undefined | null) {
    this._filterComponent = value
    // if (this._filterComponent !== value) {
    //   this._setPortal(value)
    // }
  }
  get filterComponent() { return this._filterComponent }
  private _filterComponent: ComponentType<C> | undefined | null

  @Input() options: any

  _portal: ComponentPortal<C> | null = null

  constructor(
    private _injector: Injector
  ) { }

  ngOnInit() {
    if (this.filterComponent) {
      this._setPortal(this.filterComponent)
    }
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
