import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamLayoutModule } from '@theseam/ui-common/layout'
import { TheSeamMenuModule } from '@theseam/ui-common/menu'
import { TheSeamBaseLayoutModule } from '../base-layout/index'

import { TopBarItemDirective } from './top-bar-item.directive'
import { TopBarMenuBtnDetailDirective } from './top-bar-menu-btn-detail.directive'
import { TopBarMenuButtonComponent } from './top-bar-menu-button/top-bar-menu-button.component'
import { TopBarMenuDirective } from './top-bar-menu.directive'
import { TopBarTitleComponent } from './top-bar-title/top-bar-title.component'
import { TheSeamTopBarComponent } from './top-bar.component'

@NgModule({
  declarations: [
    TheSeamTopBarComponent,
    TopBarTitleComponent,
    TopBarMenuButtonComponent,
    TopBarMenuDirective,
    TopBarItemDirective,
    TopBarMenuBtnDetailDirective
  ],
  imports: [
    CommonModule,
    TheSeamLayoutModule,
    TheSeamButtonsModule,
    TheSeamIconModule,
    TheSeamMenuModule,
    TheSeamBaseLayoutModule,
    RouterModule
  ],
  exports: [
    TheSeamTopBarComponent,
    TopBarMenuButtonComponent,
    TopBarMenuDirective,
    TheSeamMenuModule,
    TopBarItemDirective,
    TopBarMenuBtnDetailDirective
  ]
})
export class TheSeamTopBarModule { }
