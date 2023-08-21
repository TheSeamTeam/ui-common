import { BooleanInput } from '@angular/cdk/coercion'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewEncapsulation } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'
import { SeamIcon, TheSeamIconModule } from '@theseam/ui-common/icon'

@Component({
  selector: 'seam-side-nav-toggle',
  templateUrl: './side-nav-toggle.component.html',
  styleUrls: ['./side-nav-toggle.component.scss'],
  host: {
    '[class.side-nav-toggle--compact]': '!expanded'
  },
  imports: [
    CommonModule,
    TheSeamIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class SideNavToggleComponent {
  static ngAcceptInputType_expanded: BooleanInput

  @Input() @InputBoolean() expanded = false

  @Input() toggleIcon: SeamIcon | undefined | null

  @Input() toggleTpl: TemplateRef<any> | undefined | null

  @Output() toggleExpand = new EventEmitter<void>()

  toggle() {
    this.toggleExpand.emit()
  }

}
