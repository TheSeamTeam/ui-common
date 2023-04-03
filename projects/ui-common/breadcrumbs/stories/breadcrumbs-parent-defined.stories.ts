import { Meta, Story } from '@storybook/angular'

import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { StoryEmptyComponent, StoryEmptyWithRouteComponent, StoryInitialRouteModule } from '@theseam/ui-common/story-helpers'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

export default {
  title: 'Breadcrumbs/Components/Parent Defined',
  component: BreadcrumbsComponent,
  decorators: [],
} as Meta

export const Example: Story = () => ({
  applicationConfig: {
    providers: [
      provideAnimations(),
      importProvidersFrom(
        RouterModule.forRoot([
          {
            path: 'home',
            component: StoryEmptyWithRouteComponent,
            data: {
              breadcrumb: 'Home',
            },
            children: [
              {
                path: '',
                component: StoryEmptyComponent,
              }
            ]
          }
        ], { useHash: true }),
        StoryInitialRouteModule.forRoot('/home'),
      ),
    ],
  },
  moduleMetadata: {
    declarations: [
      StoryEmptyComponent,
      StoryEmptyWithRouteComponent
    ],
    providers: [ ],
    imports: [
      RouterModule,
    ],
  },
  props: { },
  template: `
    <seam-breadcrumbs></seam-breadcrumbs>
    <router-outlet></router-outlet>
  `
})
