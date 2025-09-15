import { applicationConfig, Meta, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { faBuilding } from '@fortawesome/free-regular-svg-icons'
import { provideStoryInitialUrl } from '@marklb/storybook-angular-initial-url'

import { SideNavToggleComponent } from './side-nav-toggle.component'

const meta: Meta<SideNavToggleComponent> = {
  title: 'Framework/SideNav/Toggle',
  component: SideNavToggleComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideLocationMocks(),
        provideRouter([]),
        provideStoryInitialUrl('/'),
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
