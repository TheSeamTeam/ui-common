import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'

import { LibIcon } from '../../../icon/index'

import { ISideNavItem } from '../side-nav.models'

@Component({
  selector: 'seam-side-nav-item',
  templateUrl: './side-nav-item.component.html',
  styleUrls: ['./side-nav-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNavItemComponent implements OnInit {

  faAngleLeft = faAngleLeft

  @Input() itemType: 'divider' | 'basic' | 'link' | 'button'

  @Input() icon?: LibIcon

  @Input() label: string

  @Input() link?: string
  @Input() queryParams?: { [k: string]: any }

  @Input() children?: ISideNavItem[]

  expanded = false

  constructor() { }

  ngOnInit() { }

  get hasChildren() {
    return Array.isArray(this.children) && this.children.length > 0
  }

  public toggleChildren(): void {
    this.expanded = !this.expanded
  }

}
