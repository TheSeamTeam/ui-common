import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { FlexLayoutModule } from '@angular/flex-layout'

import { TheSeamTabbedContentComponent } from './tabbed-content/tabbed-content.component'
import { TheSeamTabbedItemComponent } from './tabbed-item/tabbed-item.component'
import { TheSeamTabbedComponent } from './tabbed.component'

import { TheSeamTabbedTabContentDirective } from './directives/tabbed-tab-content.directive'
import { TheSeamTabbedTabDirective } from './directives/tabbed-tab.directive'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
  ],
  declarations: [
    TheSeamTabbedComponent,
    TheSeamTabbedTabContentDirective,
    TheSeamTabbedTabDirective,
    TheSeamTabbedItemComponent,
    TheSeamTabbedContentComponent,
    TheSeamTabbedContentComponent,
],
  exports: [
    TheSeamTabbedComponent,
    TheSeamTabbedTabContentDirective,
    TheSeamTabbedTabDirective,
    TheSeamTabbedItemComponent,
    TheSeamTabbedContentComponent,
  ]
})
export class TheSeamTabbedModule {}
