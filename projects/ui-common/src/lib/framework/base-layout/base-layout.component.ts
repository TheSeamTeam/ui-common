import { TemplatePortal } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, ContentChild, OnInit, TemplateRef, ViewContainerRef } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'

import { BaseLayoutContentDirective } from './directives/base-layout-content.directive'
import { BaseLayoutSideBarDirective } from './directives/base-layout-side-bar.directive'
import { BaseLayoutTopBarDirective } from './directives/base-layout-top-bar.directive'

@Component({
  selector: 'seam-base-layout',
  templateUrl: './base-layout.component.html',
  styleUrls: ['./base-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseLayoutComponent implements OnInit {

  faAngleDoubleRight = faAngleDoubleRight
  faAngleDoubleLeft = faAngleDoubleLeft

  @ContentChild(BaseLayoutTopBarDirective, { static: true, read: TemplateRef }) _topBarTpl: TemplateRef<any> | undefined | null
  @ContentChild(BaseLayoutSideBarDirective, { static: true, read: TemplateRef }) _sideBarTpl: TemplateRef<any> | undefined | null
  @ContentChild(BaseLayoutContentDirective, { static: true, read: TemplateRef }) _contentTpl: TemplateRef<any> | undefined | null

  _topBarPortal: TemplatePortal
  _sideBarPortal: TemplatePortal
  _contentPortal: TemplatePortal

  private _hasSideBar = new BehaviorSubject<boolean>(false)

  public hasSideBar$: Observable<boolean>

  constructor(
    private _viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit() {
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

}
