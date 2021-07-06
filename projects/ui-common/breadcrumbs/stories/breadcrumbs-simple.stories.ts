import { Meta, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { StoryEmptyComponent, StoryInitialRouteModule } from '@theseam/ui-common/story-helpers'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

export default {
  title: 'Breadcrumbs/Components/Simple',
  component: BreadcrumbsComponent,
  decorators: [ ]
} as Meta

export const Example: Story = (args) => {
  console.log('Example simple')
  return {
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
    props: { ...args },
    template: `
      <seam-breadcrumbs></seam-breadcrumbs>
      <router-outlet></router-outlet>
    `
  }
}
