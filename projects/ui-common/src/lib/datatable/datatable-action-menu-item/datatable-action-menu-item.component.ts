// import { QueryParamsHandling } from '@angular/router/src/config'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { ComponentType } from '@angular/cdk/portal'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  isDevMode,
  OnDestroy,
  OnInit,
  Optional,
  Output
} from '@angular/core'
import { Subscription } from 'rxjs'

import jexl from 'jexl'
import { untilDestroyed } from 'ngx-take-until-destroy'

import { DynamicDatatableRow } from '../../datatable-dynamic/datatable-dynamic-def'
import { TheSeamDynamicComponentLoader } from '../../dynamic-component-loader/dynamic-component-loader.service'
import { Modal } from '../../modal/index'

//
// TODO: Move the dynamic datatable logic out of this component when refactoring.
//

export interface IActionMenuItemEndpointConfig {
  /**
   * Api endpoint.
   */
  endpoint?: string

  endpointExpr?: string

  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'

  bodyExpr?: string

  paramsExpr?: string
}

export interface IActionMenuItemModalConfig {
  component: ComponentType<{}> |  string
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'seam-datatable-action-menu-item',
  templateUrl: './datatable-action-menu-item.component.html',
  styleUrls: ['./datatable-action-menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableActionMenuItemComponent implements OnInit, OnDestroy {

  @HostBinding('class.list-group-item') _listGroupItem = true
  @HostBinding('class.list-group-item-action') _listGroupItemAction = true

  @Input() label: string

  // tslint:disable-next-line:no-input-rename
  @Input('attr.href') href: string
  @Input() target: string

  // Allow routerLink inputs on menu item
  @Input() queryParams: {[k: string]: any}
  @Input() fragment: string
  // @Input() queryParamsHandling: QueryParamsHandling
  @Input() queryParamsHandling: any
  @Input() preserveFragment: boolean
  @Input() skipLocationChange: boolean
  @Input() replaceUrl: boolean
  @Input() state: {[k: string]: any}
  @Input() routerLink: string | any[]

  @Input() confirmDialog

  @Input()
  get endpointConfig(): IActionMenuItemEndpointConfig { return this._endpointConfig }
  set endpointConfig(value: IActionMenuItemEndpointConfig) {
    this._endpointConfig = value
    if (value) {
      // TODO: Handle this in a way that can be canceled.
      this._endpointConfigSub = this.click
        .pipe(untilDestroyed(this))
        .subscribe(e => this._handleEndpointAction())
    } else {
      if (this._endpointConfigSub) {
        this._endpointConfigSub.unsubscribe()
      }
    }
  }
  private _endpointConfig: IActionMenuItemEndpointConfig
  private _endpointConfigSub: Subscription

  @Input()
  get modalConfig(): IActionMenuItemModalConfig { return this._modalConfig }
  set modalConfig(value: IActionMenuItemModalConfig) {
    this._modalConfig = value
    if (value) {
      // TODO: Handle this in a way that can be canceled.
      this._modalConfigSub = this.click
        .pipe(untilDestroyed(this))
        .subscribe(e => this._handleModalAction())
    } else {
      if (this._modalConfigSub) {
        this._modalConfigSub.unsubscribe()
      }
    }
  }
  private _modalConfig: IActionMenuItemModalConfig
  private _modalConfigSub: Subscription

  @Input() row: DynamicDatatableRow

  @Input()
  set disabled(value: boolean) { this._disabled = coerceBooleanProperty(value) }
  get disabled(): boolean { return this._disabled }
  private _disabled: boolean

  @Output() click = new EventEmitter<any>()

  constructor(
    private _modal: Modal,
    private _dynamicComponentLoader: TheSeamDynamicComponentLoader,
    @Optional() private _http: HttpClient,
  ) { }

  ngOnInit() { }

  ngOnDestroy() { }

  private _handleEndpointAction() {
    if (!this._http) {
      if (isDevMode()) {
        console.warn(`[DatatableActionMenuItemDirective] Endpoint actions require \`HttpClientModule\` to be imported.`)
      }
      return
    }

    // console.log('_handleEndpointAction')
    // TODO: This should probably be done through a provider that uses the api.
    if (isDevMode()) {
      console.warn(`[DatatableActionMenuItemDirective] '_handleEndpointAction()' is not ready for production yet.`)
    } else {
      // I don't expect this to be attempted in prod before completed, so I am just adding a console warning.
      console.warn(`Unable to complete request. Contact support for assistance.`)
    }

    let endpoint = ''
    const method = this._endpointConfig.method
    const context = { row: this.row }
    // console.log('context', context)

    if (this._endpointConfig.endpoint) {
      endpoint = this._endpointConfig.endpoint
    }

    if (this._endpointConfig.endpointExpr) {
      // TODO: Use async jexl.
      endpoint = jexl.evalSync(this._endpointConfig.endpointExpr, context)
    }

    const url = `http://localhost:57648/api/${endpoint}`

    const options: any = {}
    if (this._endpointConfig.bodyExpr) {
      // TODO: Use async jexl.
      options.body = jexl.evalSync(this._endpointConfig.bodyExpr, context)
    }
    if (this._endpointConfig.paramsExpr) {
      // TODO: Use async jexl.
      options.params = jexl.evalSync(this._endpointConfig.paramsExpr, context)
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })

    this._http.request<any>(method, url, { ...options, headers })
      .subscribe()
      // .subscribe(v => console.log('v', v))
  }

  private _handleModalAction() {
    if (typeof this._modalConfig.component === 'string') {
      this._dynamicComponentLoader.getComponentFactory(this._modalConfig.component)
        .subscribe(componentFactory => {
          const factoryResolver = (<any /* ComponentFactoryBoundToModule */>componentFactory).ngModule.componentFactoryResolver
          this._modal.openFromComponent(componentFactory.componentType, undefined, factoryResolver)
        })
    } else {
      this._modal.openFromComponent(this._modalConfig.component)
    }
  }

}
