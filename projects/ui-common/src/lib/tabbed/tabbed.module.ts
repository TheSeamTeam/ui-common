import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { FlexLayoutModule } from '@angular/flex-layout'

import { TabbedContentComponent } from './tabbed-content/tabbed-content.component'
import { TabbedItemComponent } from './tabbed-item/tabbed-item.component'
import { TabbedComponent } from './tabbed.component'

import { TabbedTabContentDirective } from './directives/tabbed-tab-content.directive'
import { TabbedTabDirective } from './directives/tabbed-tab.directive'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
  ],
  declarations: [
    TabbedComponent,
    TabbedTabContentDirective,
    TabbedTabDirective,
    TabbedItemComponent,
    TabbedContentComponent,
    TabbedContentComponent,
],
  exports: [
    TabbedComponent,
    TabbedTabContentDirective,
    TabbedTabDirective,
    TabbedItemComponent,
    TabbedContentComponent,
  ]
})
export class TheSeamTabbedModule {}
