import { PortalModule } from '@angular/cdk/portal'
import { A11yModule } from '@angular/cdk/a11y'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'

import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamLayoutModule } from '@theseam/ui-common/layout'
import { TheSeamScrollbarModule } from '@theseam/ui-common/scrollbar'

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
    TheSeamLayoutModule,
    NgbTooltipModule,
    PortalModule
  ],
  exports: [
    SideNavItemComponent,
    SideNavComponent,
    SideNavToggleComponent
  ]
})
export class TheSeamSideNavModule { }
