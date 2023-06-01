import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamScrollbarModule } from '@theseam/ui-common/scrollbar'

import { TheSeamBaseLayoutComponent } from './base-layout.component'
import { BaseLayoutContentFooterDirective } from './directives/base-layout-content-footer.directive'
import { BaseLayoutContentHeaderDirective } from './directives/base-layout-content-header.directive'
import { BaseLayoutContentDirective } from './directives/base-layout-content.directive'
import { BaseLayoutNavToggleDirective } from './directives/base-layout-nav-toggle.directive'
import { BaseLayoutSideBarFooterDirective } from './directives/base-layout-side-bar-footer.directive'
import { BaseLayoutSideBarDirective } from './directives/base-layout-side-bar.directive'
import { BaseLayoutTopBarDirective } from './directives/base-layout-top-bar.directive'

@NgModule({
  declarations: [
    TheSeamBaseLayoutComponent,
    BaseLayoutContentDirective,
    BaseLayoutSideBarDirective,
    BaseLayoutSideBarFooterDirective,
    BaseLayoutTopBarDirective,
    BaseLayoutNavToggleDirective,
    BaseLayoutContentHeaderDirective,
    BaseLayoutContentFooterDirective
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
    BaseLayoutSideBarFooterDirective,
    BaseLayoutTopBarDirective,
    BaseLayoutNavToggleDirective,
    BaseLayoutContentHeaderDirective,
    BaseLayoutContentFooterDirective
  ]
})
export class TheSeamBaseLayoutModule { }
