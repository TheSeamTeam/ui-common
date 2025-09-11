import { NgModule } from '@angular/core'

import { ConfirmClickDirective } from './confirm-click.directive'
import { ConfirmDialogComponent } from './confirm-dialog.component'

@NgModule({
  imports: [
    ConfirmDialogComponent,
    ConfirmClickDirective,
  ],
  exports: [
    ConfirmDialogComponent,
    ConfirmClickDirective,
  ],
})
export class TheSeamConfirmDialogModule { }
