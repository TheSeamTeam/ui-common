import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { TheSeamCardComponent } from './card.component'
import { TheSeamCardModule } from './card.module'

const meta: Meta<TheSeamCardComponent> = {
  title: 'Card/Components',
  component: TheSeamCardComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamCardModule,
      ],
    }),
  ],
  parameters: {
    docs: {
      iframeHeight: '600px',
    },
  },
}

export default meta
type Story = StoryObj<TheSeamCardComponent>

export const Basic: Story = {
  render: args => ({
    props: { ...args },
    template: `
      <seam-card>
        <seam-card-header>Header</seam-card-header>
        <seam-card-body>Body</seam-card-body>
      </seam-card>
    `,
  }),
}
