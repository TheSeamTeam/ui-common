import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { Observable } from 'rxjs'

import { faBell, faComment } from '@fortawesome/free-regular-svg-icons'
import { faBars, faExclamationTriangle, faQuestionCircle, faSignOutAlt, faUserAlt } from '@fortawesome/free-solid-svg-icons'

import { TheSeamLayoutService } from '../../layout/index'

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

  @Input() logo: string
  @Input() logoSm?: string | null

  @Input() titleText: string
  @Input() subTitleText?: string | null

  @Input() displayName: string
  @Input() organizationName?: string | null

  public isMobile$: Observable<boolean>

  constructor(
    private _layout: TheSeamLayoutService
  ) {
    this.isMobile$ = this._layout.isMobile$
  }

  ngOnInit() { }

}
