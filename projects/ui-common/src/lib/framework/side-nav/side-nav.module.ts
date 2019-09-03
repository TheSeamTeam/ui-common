import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamIconModule } from '../../icon/index'

import { SideNavItemComponent } from './side-nav-item/side-nav-item.component'
import { SideNavComponent } from './side-nav.component'

@NgModule({
  declarations: [
    SideNavItemComponent,
    SideNavComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TheSeamIconModule
  ],
  exports: [
    SideNavItemComponent,
    SideNavComponent
  ]
})
export class TheSeamSideNavModule { }
