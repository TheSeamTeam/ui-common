import { TemplatePortal } from '@angular/cdk/portal'
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  forwardRef,
  Input,
  isDevMode,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core'
import { BehaviorSubject, from, isObservable, Observable } from 'rxjs'

import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'

import { TheSeamLayoutService } from '@theseam/ui-common/layout'

import { BaseLayoutAction, IBaseLayoutActionButton } from './base-layout-action'
import { ITheSeamBaseLayoutNav } from './base-layout-nav'
import { ITheSeamBaseLayoutRef } from './base-layout-ref'
import { THESEAM_BASE_LAYOUT_REF } from './base-layout-tokens'
import { BaseLayoutContentFooterDirective } from './directives/base-layout-content-footer.directive'
import { BaseLayoutContentHeaderDirective } from './directives/base-layout-content-header.directive'
import { BaseLayoutContentDirective } from './directives/base-layout-content.directive'
import { BaseLayoutSideBarDirective } from './directives/base-layout-side-bar.directive'
import { BaseLayoutTopBarDirective } from './directives/base-layout-top-bar.directive'

export const THE_SEAM_BASE_LAYOUT: any = {
  provide: THESEAM_BASE_LAYOUT_REF,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => TheSeamBaseLayoutComponent),
  multi: false,
}

@Component({
  selector: 'seam-base-layout',
  templateUrl: './base-layout.component.html',
  styleUrls: ['./base-layout.component.scss'],
  providers: [ THE_SEAM_BASE_LAYOUT ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TheSeamBaseLayoutComponent implements OnInit, ITheSeamBaseLayoutRef {

  faAngleDoubleRight = faAngleDoubleRight
  faAngleDoubleLeft = faAngleDoubleLeft

  @Input() overlayNav = false

  // TODO: Consider making the template queries not be dynamic. I can see this
  // potentially causing confusion or issues with potential layouts built with
  // this component.
  @ContentChild(BaseLayoutTopBarDirective, { static: true, read: TemplateRef }) _topBarTpl?: TemplateRef<any> | null
  @ContentChild(BaseLayoutSideBarDirective, { static: true, read: TemplateRef }) _sideBarTpl?: TemplateRef<any> | null
  @ContentChild(BaseLayoutContentDirective, { static: true, read: TemplateRef }) _contentTpl?: TemplateRef<any> | null
  @ContentChild(BaseLayoutContentHeaderDirective, { static: true, read: TemplateRef }) _contentHeaderTpl?: TemplateRef<any> | null
  @ContentChild(BaseLayoutContentFooterDirective, { static: true, read: TemplateRef }) _contentFooterTpl?: TemplateRef<any> | null

  _topBarPortal: TemplatePortal
  _sideBarPortal: TemplatePortal
  _contentPortal: TemplatePortal
  _contentHeaderPortal: TemplatePortal
  _contentFooterPortal: TemplatePortal

  private _hasSideBar = new BehaviorSubject<boolean>(false)

  public hasSideBar$: Observable<boolean>
  public isMobile$: Observable<boolean>

  get registeredNav() { return this._registeredNav.value }
  private _registeredNav = new BehaviorSubject<ITheSeamBaseLayoutNav | undefined>(undefined)
  public registeredNav$ = this._registeredNav.asObservable()

  get registeredActions() { return this._registeredActions.value }
  private _registeredActions = new BehaviorSubject<BaseLayoutAction[]>([])
  public registeredActions$: Observable<BaseLayoutAction[]>

  constructor(
    private _viewContainerRef: ViewContainerRef,
    private _layout: TheSeamLayoutService
  ) {
    this.registeredActions$ = this._registeredActions.asObservable()
  }

  ngOnInit() {
    this.isMobile$ = this._layout.isMobile$

    if (this._topBarTpl) {
      this._topBarPortal = new TemplatePortal(this._topBarTpl, this._viewContainerRef)
    }

    if (this._sideBarTpl) {
      this._sideBarPortal = new TemplatePortal(this._sideBarTpl, this._viewContainerRef)
      this._hasSideBar.next(true)
    }

    if (this._contentTpl) {
      this._contentPortal = new TemplatePortal(this._contentTpl, this._viewContainerRef)
    }

    if (this._contentHeaderTpl) {
      this._contentHeaderPortal = new TemplatePortal(this._contentHeaderTpl, this._viewContainerRef)
    }

    if (this._contentFooterTpl) {
      this._contentFooterPortal = new TemplatePortal(this._contentFooterTpl, this._viewContainerRef)
    }

    this.hasSideBar$ = this._hasSideBar.asObservable()
  }

  public registerNav(nav: ITheSeamBaseLayoutNav): void {
    // TODO: Allow multiple registered navs
    // if (this.registeredNav) {
    //   throw new Error('[TheSeamBaseLayoutComponent] A nav is already registered.')
    // }
    // console.log('register nav', nav)
    this._registeredNav.next(nav)
  }

  public unregisterNav(nav: ITheSeamBaseLayoutNav): void {
    if (this.registeredNav === nav) {
      this._registeredNav.next(undefined)
    }
  }

  public registerAction(action: BaseLayoutAction): void {
    const actions = this._registeredActions.value
    if (actions.findIndex(a => a.name === action.name) !== -1) {
      if (isDevMode()) {
        console.warn(
          `[TheSeamBaseLayoutComponent] registerAction(): Action ${action.name} not ` +
          'registered, because another action by that name is already registered.'
        )
      }
      return
    }
    actions.push(action)
  }

  public unregisterAction(action: BaseLayoutAction | string): void {
    const actionName = typeof action === 'string' ? action : action.name
    const actions = this._registeredActions.value
    this._registeredActions.next(actions.filter(f => f.name !== actionName))
  }

  public isActionRegistered(actionName: string): boolean {
    const actions = this._registeredActions.value
    const action = actions.find(f => f.name === actionName)
    return !!action
  }

  _handleButtonAction(action: IBaseLayoutActionButton): void {
    this._execButtonAction(action).subscribe()
  }

  _execButtonAction(action: IBaseLayoutActionButton): Observable<void> {
    const fnRes = action.exec()
    return isObservable(fnRes) ? fnRes : from(Promise.resolve(fnRes))
  }

}
