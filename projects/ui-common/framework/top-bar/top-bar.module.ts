import { NgModule } from '@angular/core'

import { TheSeamTopBarComponent } from './top-bar.component'
import { TopBarCompactMenuBtnDetailDirective } from './top-bar-compact-menu-btn-detail.directive'
import { TopBarItemDirective } from './top-bar-item.directive'
import { TopBarMenuBtnDetailDirective } from './top-bar-menu-btn-detail.directive'
import { TopBarMenuButtonComponent } from './top-bar-menu-button/top-bar-menu-button.component'
import { TopBarMenuDirective } from './top-bar-menu.directive'
import { TopBarNavToggleBtnDetailDirective } from './top-bar-nav-toggle-btn-detail.directive'
import { TopBarTitleComponent } from './top-bar-title/top-bar-title.component'

@NgModule({
  imports: [
    TheSeamTopBarComponent,
    TopBarTitleComponent,
    TopBarMenuButtonComponent,
    TopBarMenuDirective,
    TopBarItemDirective,
    TopBarMenuBtnDetailDirective,
    TopBarCompactMenuBtnDetailDirective,
    TopBarNavToggleBtnDetailDirective,
  ],
  exports: [
    TheSeamTopBarComponent,
    TopBarMenuButtonComponent,
    TopBarMenuDirective,
    TopBarItemDirective,
    TopBarMenuBtnDetailDirective,
    TopBarCompactMenuBtnDetailDirective,
    TopBarNavToggleBtnDetailDirective,
  ],
})
export class TheSeamTopBarModule {}
