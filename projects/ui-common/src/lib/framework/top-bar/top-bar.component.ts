import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

import { faBell } from '@fortawesome/free-regular-svg-icons'
import { faQuestionCircle, faSignOutAlt, faUserAlt } from '@fortawesome/free-solid-svg-icons'

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

  @Input() logo: string
  @Input() logoSm?: string | null

  @Input() titleText: string
  @Input() subTitleText?: string | null

  @Input() displayName: string
  @Input() organizationName?: string | null

  constructor() { }

  ngOnInit() { }

}
