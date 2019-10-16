import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamButtonsModule } from '../../buttons/index'
import { TheSeamIconModule } from '../../icon/index'
import { TheSeamLayoutModule } from '../../layout/index'
import { TheSeamMenuModule } from '../../menu/index'
import { TheSeamBaseLayoutModule } from '../base-layout/index'

import { TopBarMenuButtonComponent } from './top-bar-menu-button/top-bar-menu-button.component'
import { TopBarMenuDirective } from './top-bar-menu.directive'
import { TopBarTitleComponent } from './top-bar-title/top-bar-title.component'
import { TopBarComponent } from './top-bar.component'

@NgModule({
  declarations: [
    TopBarComponent,
    TopBarTitleComponent,
    TopBarMenuButtonComponent,
    TopBarMenuDirective
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
    TopBarComponent,
    TopBarMenuButtonComponent,
    TopBarMenuDirective,
    TheSeamMenuModule
  ]
})
export class TheSeamTopBarModule { }
