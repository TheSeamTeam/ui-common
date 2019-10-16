import { ChangeDetectionStrategy, Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core'
import { Observable } from 'rxjs'

import { faBell, faComment } from '@fortawesome/free-regular-svg-icons'
import { faBars, faExclamationTriangle, faQuestionCircle, faSignOutAlt, faUserAlt } from '@fortawesome/free-solid-svg-icons'

import { TheSeamLayoutService } from '../../layout/index'

import { TopBarMenuDirective } from './top-bar-menu.directive'

@Component({
  selector: 'seam-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarComponent implements OnInit {

  faUserAlt = faUserAlt
  faQuestionCircle = faQuestionCircle
  faSignOutAlt = faSignOutAlt
  faBell = faBell
  faExclamationTriangle = faExclamationTriangle
  faComment = faComment
  faBars = faBars

  @ContentChild(TopBarMenuDirective, { static: true }) _topBarMenu?: TopBarMenuDirective | null

  @Input() logo: string
  @Input() logoSm?: string | null

  @Input() hasTitle = false
  @Input() titleText: string
  @Input() subTitleText?: string | null

  @Input() displayName: string
  @Input() organizationName?: string | null

  @Input() hasNotificationsMenu = true

  public isMobile$: Observable<boolean>

  constructor(
    private _layout: TheSeamLayoutService
  ) {
    this.isMobile$ = this._layout.isMobile$
  }

  ngOnInit() { }

}
