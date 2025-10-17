import { NgIf, NgTemplateOutlet } from '@angular/common'
import { Component, Input, TemplateRef } from '@angular/core'

import { TheSeamModalModule } from '@theseam/ui-common/modal'
import { ThemeTypes } from '@theseam/ui-common/models'
import { TheSeamAutoFocusDirective } from '@theseam/ui-common/shared'

@Component({
  selector: 'seam-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  imports: [
    NgIf,
    NgTemplateOutlet,
    TheSeamModalModule,
    TheSeamAutoFocusDirective,
  ],
})
export class ConfirmDialogComponent {
  @Input() message: string | undefined | null =
    'Are you sure you want to continue?'
  @Input() alertMessage: string | undefined | null
  @Input() alertType: ThemeTypes | undefined | null = 'warning'
  @Input() template:
    | TemplateRef<any>
    | { template: TemplateRef<any>; context: any }
    | undefined
    | null

  get tpl(): TemplateRef<any> | null | undefined {
    if (this.template && 'template' in this.template) {
      return this.template.template
    }

    return this.template
  }

  get tplContext(): any {
    if (this.template && 'context' in this.template) {
      return this.template.context
    }

    return undefined
  }
}
