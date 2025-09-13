import { NgModule } from '@angular/core'

import { TheSeamTabbedTabContentDirective } from './directives/tabbed-tab-content.directive'
import { TheSeamTabbedTabDirective } from './directives/tabbed-tab.directive'
import { TheSeamTabbedContentComponent } from './tabbed-content/tabbed-content.component'
import { TheSeamTabbedItemComponent } from './tabbed-item/tabbed-item.component'
import { TheSeamTabbedComponent } from './tabbed.component'

@NgModule({
  imports: [
    TheSeamTabbedComponent,
    TheSeamTabbedTabContentDirective,
    TheSeamTabbedTabDirective,
    TheSeamTabbedItemComponent,
    TheSeamTabbedContentComponent,
  ],
  exports: [
    TheSeamTabbedComponent,
    TheSeamTabbedTabContentDirective,
    TheSeamTabbedTabDirective,
    TheSeamTabbedItemComponent,
    TheSeamTabbedContentComponent,
  ],
})
export class TheSeamTabbedModule { }
