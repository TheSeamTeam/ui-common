import { NgModule } from '@angular/core'

import { TheSeamBaseLayoutComponent } from './base-layout.component'
import { BaseLayoutContentFooterDirective } from './directives/base-layout-content-footer.directive'
import { BaseLayoutContentHeaderDirective } from './directives/base-layout-content-header.directive'
import { BaseLayoutContentDirective } from './directives/base-layout-content.directive'
import { TheSeamBaseLayoutNavToggleDirective } from './directives/base-layout-nav-toggle.directive'
import { BaseLayoutSideBarFooterDirective } from './directives/base-layout-side-bar-footer.directive'
import { BaseLayoutSideBarHeaderDirective } from './directives/base-layout-side-bar-header.directive'
import { BaseLayoutSideBarDirective } from './directives/base-layout-side-bar.directive'
import { BaseLayoutTopBarDirective } from './directives/base-layout-top-bar.directive'

@NgModule({
  imports: [
    TheSeamBaseLayoutComponent,
    BaseLayoutContentDirective,
    BaseLayoutSideBarDirective,
    BaseLayoutSideBarFooterDirective,
    BaseLayoutSideBarHeaderDirective,
    BaseLayoutTopBarDirective,
    TheSeamBaseLayoutNavToggleDirective,
    BaseLayoutContentHeaderDirective,
    BaseLayoutContentFooterDirective,
  ],
  exports: [
    TheSeamBaseLayoutComponent,
    BaseLayoutContentDirective,
    BaseLayoutSideBarDirective,
    BaseLayoutSideBarFooterDirective,
    BaseLayoutSideBarHeaderDirective,
    BaseLayoutTopBarDirective,
    TheSeamBaseLayoutNavToggleDirective,
    BaseLayoutContentHeaderDirective,
    BaseLayoutContentFooterDirective,
  ],
})
export class TheSeamBaseLayoutModule { }
