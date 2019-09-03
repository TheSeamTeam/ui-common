import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

import { ISideNavItem } from './side-nav.models'

@Component({
  selector: 'seam-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNavComponent implements OnInit {

  @Input() items: ISideNavItem[] = []

  constructor() { }

  ngOnInit() { }

}
