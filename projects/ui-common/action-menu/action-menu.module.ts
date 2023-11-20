import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { RouterModule } from '@angular/router'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamConfirmDialogModule } from '@theseam/ui-common/confirm-dialog'
import { TheSeamMenuModule } from '@theseam/ui-common/menu'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'

import { ActionMenuComponent } from './action-menu/action-menu.component'
import { ActionMenuItemComponent } from './action-menu-item/action-menu-item.component'

@NgModule({
  declarations: [
    ActionMenuComponent,
    ActionMenuItemComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    TheSeamSharedModule,
    TheSeamConfirmDialogModule,
    TheSeamMenuModule,
    TheSeamButtonsModule,
    RouterModule
  ],
  exports: [
    ActionMenuComponent,
    ActionMenuItemComponent
  ]
})
export class TheSeamActionMenuModule { }
