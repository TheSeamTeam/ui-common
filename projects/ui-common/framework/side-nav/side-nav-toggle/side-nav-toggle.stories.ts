import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { APP_BASE_HREF } from '@angular/common'
import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faBuilding } from '@fortawesome/free-regular-svg-icons'
import { StoryInitialRouteModule } from '@theseam/ui-common/story-helpers'

import { TheSeamSideNavModule } from '../side-nav.module'
import { SideNavToggleComponent } from './side-nav-toggle.component'

const meta: Meta<SideNavToggleComponent> = {
  title: 'Framework/SideNav/Toggle',
  component: SideNavToggleComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
          RouterModule.forRoot([], { useHash: true }),
          StoryInitialRouteModule.forRoot('/'),
        ),
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    }),
    moduleMetadata({
      declarations: [],
      imports: [
        TheSeamSideNavModule,
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<SideNavToggleComponent>

export const Basic: Story = {
  render: args => ({
    props: {
      itemType: 'basic',
      label: 'Example 1',
      icon: faBuilding,
    },
    template: `
      <div class="d-flex flex-row vh-100">
        <div style="width: 260px; background-color: #e9ecef;" class="h-100">
          <seam-side-nav-toggle></seam-side-nav-toggle>
        </div>
      </div>`,
  }),
}
