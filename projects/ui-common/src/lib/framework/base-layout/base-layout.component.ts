import { animate, animation, group, keyframes, query, style, transition, trigger, useAnimation } from '@angular/animations'
import { TemplatePortal } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, ContentChild, OnInit, TemplateRef, ViewContainerRef } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { debounceTime, map, publishReplay, refCount } from 'rxjs/operators'

import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'

import { LibIcon } from '../../icon/index'

import { BaseLayoutContentDirective } from './directives/base-layout-content.directive'
import { BaseLayoutSideBarDirective } from './directives/base-layout-side-bar.directive'
import { BaseLayoutTopBarDirective } from './directives/base-layout-top-bar.directive'

const SIDE_BAR_OPEN_SIZE = 260
const SIDE_BAR_CLOSED_SIZE = 50
const SIDE_BAR_OPEN_CLOSE_DURATION = 300

export const sideBarClosedToOpen = animation([
  style({ width: '{{ closedSize }}px' }),
  animate('{{ duration }}ms', style({ width: '{{ openSize }}px' }))
], { params: {
  duration: SIDE_BAR_OPEN_CLOSE_DURATION,
  openSize: SIDE_BAR_OPEN_SIZE,
  closedSize: SIDE_BAR_CLOSED_SIZE
} })

export const sideBarOpenToClosed = animation([
  style({ width: '{{ openSize }}px' }),
  animate('{{ duration }}ms', style({ width: '{{ closedSize }}px' }))
], { params: {
  duration: SIDE_BAR_OPEN_CLOSE_DURATION,
  openSize: SIDE_BAR_OPEN_SIZE,
  closedSize: SIDE_BAR_CLOSED_SIZE
} })

@Component({
  selector: 'seam-base-layout',
  templateUrl: './base-layout.component.html',
  styleUrls: ['./base-layout.component.scss'],
  animations: [
    trigger('sideBarToggle', [
      transition('closed => open', useAnimation(sideBarClosedToOpen)),
      transition('open => closed', useAnimation(sideBarOpenToClosed))
    ]),
  ],
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

  public readonly sideBarSizeOpen = SIDE_BAR_OPEN_SIZE
  public readonly sideBarSizeClosed = SIDE_BAR_CLOSED_SIZE

  private _sideBarOpen = new BehaviorSubject<boolean>(true)
  private _hasSideBar = new BehaviorSubject<boolean>(false)

  public hasSideBar$: Observable<boolean>
  public sideBarOpen$: Observable<boolean>
  public sideBarToggleIcon$: Observable<LibIcon>
  public sideBarSize$: Observable<number>
  public sideBarToggleState$: Observable<string>

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

    this.sideBarOpen$ = this._sideBarOpen
      .pipe(
        debounceTime(0),
        publishReplay(1),
        refCount()
      )

    this.sideBarToggleIcon$ = this.sideBarOpen$
      .pipe(map(isOpen => isOpen ? faAngleDoubleLeft : faAngleDoubleRight))

    this.sideBarSize$ = this.sideBarOpen$
      .pipe(map(isOpen => isOpen ? this.sideBarSizeOpen : this.sideBarSizeClosed))

    this.sideBarToggleState$ = this.sideBarOpen$
      .pipe(map(isOpen => isOpen ? 'open' : 'closed'))
  }

  public toggleSideBar() {
    this._sideBarOpen.next(!this._sideBarOpen.value)
  }

}
