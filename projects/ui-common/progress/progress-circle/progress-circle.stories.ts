import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { TheSeamProgressModule } from '../progress.module'
import { ProgressCircleComponent } from './progress-circle.component'

const meta: Meta<ProgressCircleComponent> = {
  title: 'Progress/Components/ProgressCircle',
  component: ProgressCircleComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamProgressModule,
      ],
    }),
  ],
  parameters: {
    docs: {
      iframeHeight: '300px',
    },
  },
}

export default meta
type Story = StoryObj<ProgressCircleComponent>

export const Basic: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-progress-circle style="position: relative; width: 100px; height: 100px"
        [fillBackground]="fillBackground"
        [showText]="showText"
        [hiddenOnEmpty]="hiddenOnEmpty"
        [percentage]="percentage"
        [pending]="pending">
      </seam-progress-circle>`,
  }),
  args: {
    hiddenOnEmpty: false,
    percentage: 35,
  },
  argTypes: {
    percentage: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
}
