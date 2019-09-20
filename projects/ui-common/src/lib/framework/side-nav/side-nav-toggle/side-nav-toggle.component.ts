import { ChangeDetectionStrategy, Component, EventEmitter, Host, Input, OnInit, Optional, Output, SkipSelf } from '@angular/core'

import { faBars } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'seam-side-nav-toggle',
  templateUrl: './side-nav-toggle.component.html',
  styleUrls: ['./side-nav-toggle.component.scss'],
  host: {
    '[class.side-nav-toggle--compact]': '!expanded'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNavToggleComponent implements OnInit {

  faBars = faBars

  @Input() expanded = false

  @Output() toggleExpand = new EventEmitter<void>()

  constructor() { }

  ngOnInit() { }

  toggle() {
    this.toggleExpand.emit()
  }

}
