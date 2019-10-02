import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamButtonsModule } from '../../buttons/index'
import { TheSeamIconModule } from '../../icon/index'
import { TheSeamScrollbarModule } from '../../scrollbar/index'

import { TheSeamBaseLayoutComponent } from './base-layout.component'
import { BaseLayoutContentDirective } from './directives/base-layout-content.directive'
import { BaseLayoutNavToggleDirective } from './directives/base-layout-nav-toggle.directive'
import { BaseLayoutSideBarDirective } from './directives/base-layout-side-bar.directive'
import { BaseLayoutTopBarDirective } from './directives/base-layout-top-bar.directive'



@NgModule({
  declarations: [
    TheSeamBaseLayoutComponent,
    BaseLayoutContentDirective,
    BaseLayoutSideBarDirective,
    BaseLayoutTopBarDirective,
    BaseLayoutNavToggleDirective
  ],
  imports: [
    CommonModule,
    PortalModule,
    TheSeamScrollbarModule,
    TheSeamIconModule,
    TheSeamButtonsModule
  ],
  exports: [
    TheSeamBaseLayoutComponent,
    BaseLayoutContentDirective,
    BaseLayoutSideBarDirective,
    BaseLayoutTopBarDirective,
    BaseLayoutNavToggleDirective
  ]
})
export class TheSeamBaseLayoutModule { }
