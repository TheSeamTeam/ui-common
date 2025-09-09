import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetContentHeaderComponent } from './widget-content-header.component'

const meta: Meta<WidgetContentHeaderComponent> = {
  title: 'Widget/Components/Content/Content Header',
  component: WidgetContentHeaderComponent,
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
type Story = StoryObj<WidgetContentHeaderComponent>

export const Basic: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-content-header>{{ contentHeaderText }}</seam-widget-content-header>
        </seam-widget>
      </div>`,
  }),
  args: {
    contentHeaderText: 'Content Header Text',
  },
}
