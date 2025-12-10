import { NgModule } from '@angular/core'

import { HorizontalNavComponent } from './horizontal-nav/horizontal-nav.component'
import { NavItemComponent } from './nav-item/nav-item.component'

@NgModule({
  imports: [NavItemComponent, HorizontalNavComponent],
  exports: [NavItemComponent, HorizontalNavComponent],
})
export class TheSeamNavModule {}
