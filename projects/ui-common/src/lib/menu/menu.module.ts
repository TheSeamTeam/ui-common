import { OverlayModule } from '@angular/cdk/overlay'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamIconModule } from '@lib/ui-common/icon'

import { MenuDividerComponent } from './menu-divider.component'
import { MenuFooterActionComponent } from './menu-footer-action/menu-footer-action.component'
import { MenuFooterComponent } from './menu-footer/menu-footer.component'
import { MenuHeaderComponent } from './menu-header/menu-header.component'
import { MenuItemComponent } from './menu-item.component'
import { MenuToggleDirective } from './menu-toggle.directive'
import { MenuComponent } from './menu.component'

@NgModule({
  declarations: [
    MenuComponent,
    MenuToggleDirective,
    MenuItemComponent,
    MenuDividerComponent,
    MenuFooterComponent,
    MenuFooterActionComponent,
    MenuHeaderComponent,
  ],
  imports: [
    CommonModule,
    OverlayModule,
    TheSeamIconModule
  ],
  exports: [
    MenuComponent,
    MenuToggleDirective,
    MenuItemComponent,
    MenuDividerComponent,

    TheSeamIconModule,
    OverlayModule,
    MenuFooterComponent,
    MenuFooterActionComponent,
    MenuHeaderComponent
  ]
})
export class TheSeamMenuModule { }
