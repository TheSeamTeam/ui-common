import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamPopoverDirective } from './popover.directive'
import { TheSeamPopoverModule } from './popover.module'

interface StoryExtraProps {}

const meta: Meta<TheSeamPopoverDirective & StoryExtraProps> = {
  title: 'Popover',
  component: TheSeamPopoverDirective,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      imports: [BrowserModule, TheSeamPopoverModule],
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
