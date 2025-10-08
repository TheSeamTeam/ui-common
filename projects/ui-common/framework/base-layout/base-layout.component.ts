import { PortalModule, TemplatePortal } from '@angular/cdk/portal'
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  forwardRef,
  inject,
  Input,
  isDevMode,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core'
import { AsyncPipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common'
import { BehaviorSubject, from, isObservable, Observable } from 'rxjs'

import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'
import { MediaQueryAliases, TheSeamLayoutService } from '@theseam/ui-common/layout'
import { TheSeamOverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'

import { TheSeamBaseLayoutAction, TheSeamBaseLayoutActionButton } from './base-layout-action'
import { TheSeamBaseLayoutNav } from './base-layout-nav'
import { TheSeamBaseLayoutRef } from './base-layout-ref'
import { THESEAM_BASE_LAYOUT_REF } from './base-layout-tokens'
import { BaseLayoutContentFooterDirective } from './directives/base-layout-content-footer.directive'
import { BaseLayoutContentHeaderDirective } from './directives/base-layout-content-header.directive'
import { BaseLayoutContentDirective } from './directives/base-layout-content.directive'
import { BaseLayoutSideBarDirective } from './directives/base-layout-side-bar.directive'
import { BaseLayoutTopBarDirective } from './directives/base-layout-top-bar.directive'

export const THE_SEAM_BASE_LAYOUT: any = {
  provide: THESEAM_BASE_LAYOUT_REF,
  useExisting: forwardRef(() => TheSeamBaseLayoutComponent),
  multi: false,
}

@Component({
  selector: 'seam-base-layout',
  templateUrl: './base-layout.component.html',
  styleUrls: ['./base-layout.component.scss'],
  providers: [ THE_SEAM_BASE_LAYOUT ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgIf,
    NgFor,
    NgTemplateOutlet,
    AsyncPipe,
    PortalModule,
    TheSeamOverlayScrollbarDirective,
  ],
})
export class TheSeamBaseLayoutComponent implements OnInit, TheSeamBaseLayoutRef {

  private readonly _viewContainerRef = inject(ViewContainerRef)
  private readonly _layout = inject(TheSeamLayoutService)

  readonly faAngleDoubleRight = faAngleDoubleRight
  readonly faAngleDoubleLeft = faAngleDoubleLeft

  @Input() overlayNav = false

  @Input() mobileBreakpoint: MediaQueryAliases | undefined

  @Input() showSidebar: boolean | undefined = true

  // TODO: Consider making the template queries not be dynamic. I can see this
  // potentially causing confusion or issues with potential layouts built with
  // this component.
  @ContentChild(BaseLayoutTopBarDirective, { static: true, read: TemplateRef }) _topBarTpl?: TemplateRef<any> | null
  @ContentChild(BaseLayoutSideBarDirective, { static: true, read: TemplateRef }) _sideBarTpl?: TemplateRef<any> | null
  @ContentChild(BaseLayoutContentDirective, { static: true, read: TemplateRef }) _contentTpl?: TemplateRef<any> | null
  @ContentChild(BaseLayoutContentHeaderDirective, { static: true, read: TemplateRef }) _contentHeaderTpl?: TemplateRef<any> | null
  @ContentChild(BaseLayoutContentFooterDirective, { static: true, read: TemplateRef }) _contentFooterTpl?: TemplateRef<any> | null

  _topBarPortal?: TemplatePortal
  _sideBarPortal?: TemplatePortal
  _contentPortal?: TemplatePortal
  _contentHeaderPortal?: TemplatePortal
  _contentFooterPortal?: TemplatePortal

  private readonly _hasSideBar = new BehaviorSubject<boolean>(false)

  public readonly hasSideBar$: Observable<boolean>
  public readonly isMobile$: Observable<boolean>

  get registeredNav() { return this._registeredNav.value }
  private readonly _registeredNav = new BehaviorSubject<TheSeamBaseLayoutNav | undefined>(undefined)
  public readonly registeredNav$ = this._registeredNav.asObservable()

  get registeredActions() { return this._registeredActions.value }
  private readonly _registeredActions = new BehaviorSubject<TheSeamBaseLayoutAction[]>([])
  public readonly registeredActions$: Observable<TheSeamBaseLayoutAction[]>

  constructor() {
    this.registeredActions$ = this._registeredActions.asObservable()

    this.isMobile$ = this._layout.isMobile$
    this.hasSideBar$ = this._hasSideBar.asObservable()
  }

  ngOnInit() {
    if (this.mobileBreakpoint) {
      this._layout.setMobileBreakpoint(this.mobileBreakpoint)
    }

    if (this._topBarTpl) {
      this._topBarPortal = new TemplatePortal(this._topBarTpl, this._viewContainerRef)
    }

    if (this._sideBarTpl) {
      this._sideBarPortal = new TemplatePortal(this._sideBarTpl, this._viewContainerRef)
      if (this.showSidebar) {
        this._hasSideBar.next(true)
      }
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
  }

  public registerNav(nav: TheSeamBaseLayoutNav): void {
    // TODO: Allow multiple registered navs
    // if (this.registeredNav) {
    //   throw new Error('[TheSeamBaseLayoutComponent] A nav is already registered.')
    // }
    // console.log('register nav', nav)
    this._registeredNav.next(nav)
  }

  public unregisterNav(nav: TheSeamBaseLayoutNav): void {
    if (this.registeredNav === nav) {
      this._registeredNav.next(undefined)
    }
  }

  public registerAction(action: TheSeamBaseLayoutAction): void {
    const actions = this._registeredActions.value
    if (actions.findIndex(a => a.name === action.name) !== -1) {
      if (isDevMode()) {
        // eslint-disable-next-line no-console
        console.warn(
          `[TheSeamBaseLayoutComponent] registerAction(): Action ${action.name} not ` +
          'registered, because another action by that name is already registered.',
        )
      }
      return
    }
    actions.push(action)
  }

  public unregisterAction(action: TheSeamBaseLayoutAction | string): void {
    const actionName = typeof action === 'string' ? action : action.name
    const actions = this._registeredActions.value
    this._registeredActions.next(actions.filter(f => f.name !== actionName))
  }

  public isActionRegistered(actionName: string): boolean {
    const actions = this._registeredActions.value
    const action = actions.find(f => f.name === actionName)
    return !!action
  }

  _handleButtonAction(action: TheSeamBaseLayoutActionButton): void {
    this._execButtonAction(action).subscribe()
  }

  _execButtonAction(action: TheSeamBaseLayoutActionButton): Observable<void> {
    const fnRes = action.exec()
    return isObservable(fnRes) ? fnRes : from(Promise.resolve(fnRes))
  }

}
