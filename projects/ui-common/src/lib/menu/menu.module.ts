import { OverlayModule } from '@angular/cdk/overlay'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamIconModule } from '../icon/icon.module'

import { MenuDividerComponent } from './menu-divider.component'
import { MenuItemComponent } from './menu-item.component'
import { MenuToggleDirective } from './menu-toggle.directive'
import { MenuComponent } from './menu.component'

@NgModule({
  declarations: [
    MenuComponent,
    MenuToggleDirective,
    MenuItemComponent,
    MenuDividerComponent
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
    OverlayModule
  ]
})
export class TheSeamMenuModule { }
