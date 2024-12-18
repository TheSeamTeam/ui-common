import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { CardActionComponent } from './card-action/card-action.component'
import { CardBodyComponent } from './card-body/card-body.component'
import { CardFooterComponent } from './card-footer/card-footer.component'
import { CardHeaderComponent } from './card-header/card-header.component'
import { CardComponent } from './card.component'
import { TheSeamCardModule } from './card.module'

const meta: Meta<CardComponent> = {
  title: 'Card/Components',
  component: CardComponent,
  subcomponents: [
    CardActionComponent,
    CardBodyComponent,
    CardFooterComponent,
    CardHeaderComponent
  ],
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamCardModule
      ]
    })
  ],
  parameters: {
    docs: {
      iframeHeight: '600px',
    }
  }
}

export default meta
type Story = StoryObj<CardComponent>

export const Basic: Story = {
  render: args => ({
    props: { ...args },
    template: `
      <seam-card>
        <seam-card-header>Header</seam-card-header>
        <seam-card-body>Body</seam-card-body>
      </seam-card>
    `
  }),
}
