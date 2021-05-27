import { Meta, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { StoryEmptyComponent, StoryInitialRouteModule } from '@theseam/ui-common/story-helpers'

import { withKnobs } from '@storybook/addon-knobs'
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

export default {
  title: 'Components/Breadcrumbs/Simple',
  component: BreadcrumbsComponent,
  decorators: [
    withKnobs
  ]
} as Meta

export const Example: Story = () => ({
  moduleMetadata: {
    declarations: [
      StoryEmptyComponent
    ],
    providers: [ ],
    imports: [
      BrowserAnimationsModule,
      BrowserModule,
      RouterModule.forRoot([
        {
          path: 'home',
          component: StoryEmptyComponent,
          data: {
            breadcrumb: 'Home'
          }
        }
      ], { useHash: true }),
      StoryInitialRouteModule.forRoot('/home')
    ]
  },
  props: { },
  template: `
    <seam-breadcrumbs></seam-breadcrumbs>
    <router-outlet></router-outlet>
  `
})
