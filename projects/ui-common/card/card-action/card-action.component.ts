import { BooleanInput } from '@angular/cdk/coercion'
import { Component, HostBinding, Input } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'
import type { ThemeTypes } from '@theseam/ui-common/models'

@Component({
  selector: 'seam-card-action',
  templateUrl: './card-action.component.html',
  styleUrls: ['./card-action.component.scss']
})
export class CardActionComponent {
  static ngAcceptInputType_isLastAction: BooleanInput

  @HostBinding('class.border-left') _cssClassBorderLeft = true

  @Input() theme: ThemeTypes | undefined | null = 'lightgray'

  @Input() title: string | undefined | null

  @Input() @InputBoolean() isLastAction: boolean = false

}
