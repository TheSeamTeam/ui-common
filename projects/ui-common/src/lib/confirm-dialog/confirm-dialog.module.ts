import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamIconModule } from '@lib/ui-common/icon'
import { TheSeamModalModule } from '@lib/ui-common/modal'
import { TheSeamSharedModule } from '@lib/ui-common/shared'

import { ConfirmClickDirective } from './confirm-click.directive'
import { ConfirmDialogComponent } from './confirm-dialog.component'
import { SeamConfirmDialogService } from './confirm-dialog.service'

@NgModule({
  declarations: [
    ConfirmDialogComponent,
    ConfirmClickDirective
  ],
  imports: [
    CommonModule,
    TheSeamSharedModule,
    TheSeamModalModule,
    TheSeamIconModule
  ],
  exports: [
    ConfirmDialogComponent,
    ConfirmClickDirective
  ],
  entryComponents: [
    ConfirmDialogComponent
  ],
  providers: [
    SeamConfirmDialogService
  ]
})
export class TheSeamConfirmDialogModule { }
