import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { provideAnimations } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetFooterTextComponent } from './widget-footer-text.component'

const meta: Meta<WidgetFooterTextComponent> = {
  title: 'Widget/Components/Content/Footer Text',
  component: WidgetFooterTextComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamWidgetModule,
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<WidgetFooterTextComponent>

export const Basic: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-footer-text>{{ footerText }}</seam-widget-footer-text>
        </seam-widget>
      </div>`,
  }),
  args: {
    footerText: 'Footer Text',
  },
}
