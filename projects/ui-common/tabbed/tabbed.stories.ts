import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'
import { of } from 'rxjs'

import { TheSeamTabbedComponent } from './tabbed.component'
import { TheSeamTabbedModule } from './tabbed.module'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ExtraArgs {}

type StoryComponentType = TheSeamTabbedComponent & ExtraArgs

const meta: Meta<StoryComponentType> = {
  title: 'Tabs/Components',
  component: TheSeamTabbedComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideLocationMocks(),
        provideRouter([]),
      ],
    }),
    moduleMetadata({
      imports: [TheSeamTabbedModule],
    }),
  ],
}

export default meta
type Story = StoryObj<StoryComponentType>

export const Basic: Story = {
  render: (args) => ({
    template: `
      <seam-tabbed [activeTabName]="activeTabName$ | async">
        <seam-tabbed-item name="tab-1" label="Tab 1">
          <div class="p-4" *seamTabbedTabContent>
            Tab 1 Content
          </div>
        </seam-tabbed-item>
        <seam-tabbed-item name="tab-2" label="Tab 2">
          <div class="p-4" *seamTabbedTabContent>
            Tab 2 Content
          </div>
        </seam-tabbed-item>
        <seam-tabbed-item name="tab-3" label="Tab 3">
          <div class="p-4" *seamTabbedTabContent>
            Tab 3 Content
          </div>
        </seam-tabbed-item>
      </seam-tabbed>
    `,
    props: {
      ...args,
      activeTabName$: of('tab-2'),
    },
  }),
}
