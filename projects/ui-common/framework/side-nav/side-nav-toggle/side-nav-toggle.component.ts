import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core'

import { faBars } from '@fortawesome/free-solid-svg-icons'

import { InputBoolean } from '@theseam/ui-common/core'

@Component({
  selector: 'seam-side-nav-toggle',
  templateUrl: './side-nav-toggle.component.html',
  styleUrls: ['./side-nav-toggle.component.scss'],
  host: {
    '[class.side-nav-toggle--compact]': '!expanded'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SideNavToggleComponent implements OnInit {
  static ngAcceptInputType_expanded: BooleanInput

  faBars = faBars

  @Input() @InputBoolean() expanded = false

  @Output() toggleExpand = new EventEmitter<void>()

  constructor() { }

  ngOnInit() { }

  toggle() {
    this.toggleExpand.emit()
  }

}
