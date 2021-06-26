import { Meta, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { StoryEmptyComponent, StoryEmptyWithRouteComponent, StoryInitialRouteModule } from '@theseam/ui-common/story-helpers'

// import { withKnobs } from '@storybook/addon-knobs'
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

export default {
  title: 'Breadcrumbs/Components/Parent Defined',
  component: BreadcrumbsComponent,
  decorators: [
    // withKnobs
  ]
} as Meta

export const Example: Story = () => ({
  moduleMetadata: {
    declarations: [
      StoryEmptyComponent,
      StoryEmptyWithRouteComponent
    ],
    providers: [ ],
    imports: [
      BrowserAnimationsModule,
      BrowserModule,
      RouterModule.forRoot([
        {
          path: 'home',
          component: StoryEmptyWithRouteComponent,
          data: {
            breadcrumb: 'Home'
          },
          children: [
            {
              path: '',
              component: StoryEmptyComponent,
            }
          ]
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
