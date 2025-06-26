import { NgModule } from '@angular/core'

import { SideNavItemComponent } from './side-nav-item/side-nav-item.component'
import { SideNavToggleComponent } from './side-nav-toggle/side-nav-toggle.component'
import { SideNavComponent } from './side-nav.component'

@NgModule({
  imports: [
    SideNavItemComponent,
    SideNavComponent,
    SideNavToggleComponent,
  ],
  exports: [
    SideNavItemComponent,
    SideNavComponent,
    SideNavToggleComponent,
  ]
})
export class TheSeamSideNavModule { }
