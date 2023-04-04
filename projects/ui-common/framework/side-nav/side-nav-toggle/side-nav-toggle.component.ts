import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewEncapsulation } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'
import { SeamIcon } from '@theseam/ui-common/icon'

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

  @Input() @InputBoolean() expanded = false

  @Input() toggleIcon: SeamIcon | undefined | null

  @Input() toggleTpl: TemplateRef<any> | undefined | null

  @Output() toggleExpand = new EventEmitter<void>()

  constructor() { }

  ngOnInit() { }

  toggle() {
    this.toggleExpand.emit()
  }

}
