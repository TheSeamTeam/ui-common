import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamModalModule } from '@theseam/ui-common/modal'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'

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
    providers: [
        SeamConfirmDialogService
    ]
})
export class TheSeamConfirmDialogModule { }
