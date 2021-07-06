import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { CardActionComponent } from './card-action/card-action.component'
import { CardBodyComponent } from './card-body/card-body.component'
import { CardFooterComponent } from './card-footer/card-footer.component'
import { CardHeaderComponent } from './card-header/card-header.component'
import { CardComponent } from './card.component'
import { TheSeamCardModule } from './card.module'

export default {
  title: 'Card/Components',
  component: CardComponent,
  subcomponents: [
    CardActionComponent,
    CardBodyComponent,
    CardFooterComponent,
    CardHeaderComponent
  ],
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamCardModule
      ]
    })
  ],
  parameters: {
    docs: {
      iframeHeight: '600px',
    }
  }
} as Meta

export const Basic: Story = (args) => ({
  props: { ...args },
  template: `
    <seam-card>
      <seam-card-header>Header</seam-card-header>
      <seam-card-body>Body</seam-card-body>
    </seam-card>
  `
})
