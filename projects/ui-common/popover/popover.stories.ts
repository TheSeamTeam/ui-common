import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamPopoverDirective } from './popover.directive'
import { TheSeamPopoverModule } from './popover.module'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface StoryExtraProps {}

const meta: Meta<TheSeamPopoverDirective & StoryExtraProps> = {
  title: 'Popover',
  component: TheSeamPopoverDirective,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      imports: [TheSeamPopoverModule],
    }),
  ],
  parameters: {
    docs: {
      iframeHeight: '200px',
    },
  },
}

export default meta
type Story = StoryObj<TheSeamPopoverDirective & StoryExtraProps>

export const Basic: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="p-1">
        <ng-template #popoverTpl>
          Example Popover
        </ng-template>
        <button type="button" class="btn btn-primary" [seamPopover]="popoverTpl">Open Popover</button>
      </div>
    `,
  }),
}

export const LongContent: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="p-1">
        <ng-template #popoverTpl>
          <h4>Example Popover with Long Content</h4>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </ng-template>
        <button type="button" class="btn btn-primary" [seamPopover]="popoverTpl" seamPopoverBaseWidth="300">Open Popover With Long Content</button>
      </div>
    `,
  }),
}
