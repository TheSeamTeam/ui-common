import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

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

  @Input() logo: string
  @Input() logoSm: string

  @Input() titleText: string
  @Input() subTitleText?: string | null

  constructor() { }

  ngOnInit() { }

}
