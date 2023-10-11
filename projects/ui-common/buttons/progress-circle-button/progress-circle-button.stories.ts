import { Meta, StoryObj, moduleMetadata } from '@storybook/angular'

import { buttonTypeArgType, sizeArgType, themeWithOutlineArgType } from '@theseam/ui-common/story-helpers'

import { TheSeamButtonsModule } from '../buttons.module'
import { TheSeamProgressCircleButtonComponent } from './progress-circle-button.component'

interface StoryExtraProps {
  btnText: string
}

const meta: Meta<TheSeamProgressCircleButtonComponent & StoryExtraProps> = {
  title: 'Buttons/Components/ProgressCircleButton',
  component: TheSeamProgressCircleButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamButtonsModule,
      ],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    btnText: {
      control: { type: 'text' },
    },
    percentage: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    theme: { ...themeWithOutlineArgType },
    size: sizeArgType,
    type: buttonTypeArgType,
  },
  args: {
    btnText: 'Percentage Button',
    percentage: 60,
    theme: 'outline-primary',
  },
}

export default meta
type Story = StoryObj<TheSeamProgressCircleButtonComponent & StoryExtraProps>

export const Basic: Story = {
  render: args => ({
    props: args,
    template: `
      <button seamProgressCircleButton
        theme="{{ theme }}"
        [size]="size"
        [type]="type"
        [fillBackground]="fillBackground"
        [showText]="showText"
        [hiddenOnEmpty]="hiddenOnEmpty"
        [percentage]="percentage">
        {{ btnText }}
      </button>
    `,
  }),
}
