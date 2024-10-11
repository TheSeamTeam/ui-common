import { A11yModule } from '@angular/cdk/a11y'
import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'

import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamLayoutModule } from '@theseam/ui-common/layout'
import { TheSeamMenuModule } from '@theseam/ui-common/menu'
import { TheSeamScrollbarModule } from '@theseam/ui-common/scrollbar'
import { HorizontalNavComponent } from './horizontal-nav/horizontal-nav.component'

import { NavItemComponent } from './nav-item/nav-item.component'
import { TheSeamNavService } from './nav.service'

@NgModule({
  declarations: [
    NavItemComponent,
    HorizontalNavComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    TheSeamIconModule,
    A11yModule,
    TheSeamScrollbarModule,
    TheSeamLayoutModule,
    NgbTooltipModule,
    PortalModule,
    TheSeamMenuModule
  ],
  exports: [
    NavItemComponent,
    HorizontalNavComponent,
  ],
  providers: [
    TheSeamNavService,
  ]
})
export class TheSeamNavModule { }
