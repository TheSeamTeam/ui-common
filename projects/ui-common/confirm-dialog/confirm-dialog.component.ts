import { Component, Input, TemplateRef } from '@angular/core'

import type { ThemeTypes } from '@theseam/ui-common/models'

@Component({
  selector: 'seam-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  @Input() message: string | undefined | null = 'Are you sure you want to continue?'
  @Input() alertMessage: string | undefined | null
  @Input() alertType: ThemeTypes | undefined | null = 'warning'
  @Input() template: TemplateRef<any> | { template: TemplateRef<any>, context: any } | undefined | null

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
