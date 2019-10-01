import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamButtonsModule } from '../../buttons/index'
import { TheSeamIconModule } from '../../icon/index'
import { TheSeamLayoutModule } from '../../layout/index'
import { TheSeamMenuModule } from '../../menu/index'

import { TopBarMenuButtonComponent } from './top-bar-menu-button/top-bar-menu-button.component'
import { TopBarTitleComponent } from './top-bar-title/top-bar-title.component'
import { TopBarComponent } from './top-bar.component'

@NgModule({
  declarations: [
    TopBarComponent,
    TopBarTitleComponent,
    TopBarMenuButtonComponent
  ],
  imports: [
    CommonModule,
    TheSeamLayoutModule,
    TheSeamButtonsModule,
    TheSeamIconModule,
    TheSeamMenuModule,
    RouterModule
  ],
  exports: [
    TopBarComponent
  ]
})
export class TheSeamTopBarModule { }
