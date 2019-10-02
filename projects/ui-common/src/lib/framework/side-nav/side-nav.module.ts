import { A11yModule } from '@angular/cdk/a11y'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamIconModule } from '../../icon/index'
import { TheSeamLayoutModule } from '../../layout/index'
import { TheSeamScrollbarModule } from '../../scrollbar/index'

import { SideNavItemComponent } from './side-nav-item/side-nav-item.component'
import { SideNavToggleComponent } from './side-nav-toggle/side-nav-toggle.component'
import { SideNavComponent } from './side-nav.component'

@NgModule({
  declarations: [
    SideNavItemComponent,
    SideNavComponent,
    SideNavToggleComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TheSeamIconModule,
    A11yModule,
    TheSeamScrollbarModule,
    TheSeamLayoutModule
  ],
  exports: [
    SideNavItemComponent,
    SideNavComponent,
    SideNavToggleComponent
  ]
})
export class TheSeamSideNavModule { }
