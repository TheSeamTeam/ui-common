import { TemplatePortal } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, ContentChild, forwardRef, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'

import { TheSeamLayoutService } from '../../layout/index'

import { ITheSeamBaseLayoutNav } from './base-layout-nav'
import { ITheSeamBaseLayoutRef } from './base-layout-ref'
import { THESEAM_BASE_LAYOUT_REF } from './base-layout-tokens'
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamBaseLayoutComponent implements OnInit, ITheSeamBaseLayoutRef {

  faAngleDoubleRight = faAngleDoubleRight
  faAngleDoubleLeft = faAngleDoubleLeft

  @Input() overlayNav = false

  @ContentChild(BaseLayoutTopBarDirective, { static: true, read: TemplateRef }) _topBarTpl: TemplateRef<any> | undefined | null
  @ContentChild(BaseLayoutSideBarDirective, { static: true, read: TemplateRef }) _sideBarTpl: TemplateRef<any> | undefined | null
  @ContentChild(BaseLayoutContentDirective, { static: true, read: TemplateRef }) _contentTpl: TemplateRef<any> | undefined | null

  _topBarPortal: TemplatePortal
  _sideBarPortal: TemplatePortal
  _contentPortal: TemplatePortal

  private _hasSideBar = new BehaviorSubject<boolean>(false)

  public hasSideBar$: Observable<boolean>
  public isMobile$: Observable<boolean>

  get registeredNav() { return this._registeredNav.value }
  private _registeredNav = new BehaviorSubject<ITheSeamBaseLayoutNav | undefined>(undefined)
  public registeredNav$ = this._registeredNav.asObservable()

  constructor(
    private _viewContainerRef: ViewContainerRef,
    private _layout: TheSeamLayoutService
  ) { }

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

}
