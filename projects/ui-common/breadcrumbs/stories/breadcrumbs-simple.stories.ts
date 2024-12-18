import { Meta, StoryObj } from '@storybook/angular'

import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { StoryEmptyComponent, StoryInitialRouteModule } from '@theseam/ui-common/story-helpers'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

const meta: Meta<BreadcrumbsComponent> = {
  title: 'Breadcrumbs/Components/Simple',
  component: BreadcrumbsComponent,
  decorators: [ ]
}

export default meta
type Story = StoryObj<BreadcrumbsComponent>

export const Example: Story = {
  render: args => {
    return {
      applicationConfig: {
        providers: [
          provideAnimations(),
          importProvidersFrom(
            RouterModule.forRoot([
              {
                path: 'home',
                component: StoryEmptyComponent,
                data: {
                  breadcrumb: 'Home'
                }
              }
            ], { useHash: true }),
            StoryInitialRouteModule.forRoot('/home'),
          ),
        ],
      },
      moduleMetadata: {
        declarations: [
          StoryEmptyComponent,
        ],
        providers: [ ],
        imports: [
          RouterModule,
        ],
      },
      props: { ...args },
      template: `
        <seam-breadcrumbs></seam-breadcrumbs>
        <router-outlet></router-outlet>
      `,
    }
  },
}
