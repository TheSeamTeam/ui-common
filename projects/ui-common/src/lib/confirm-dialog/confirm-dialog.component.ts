import { Component, Input } from '@angular/core'

import type { ThemeTypes } from '../models/index'

@Component({
  selector: 'seam-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  @Input() message = 'Are you sure you want to continue?'
  @Input() alertMessage: string
  @Input() alertType: ThemeTypes = 'warning'

}
