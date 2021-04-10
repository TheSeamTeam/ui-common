import { Component, Input } from '@angular/core'

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

}
