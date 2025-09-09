import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetEmptyLabelComponent } from './widget-empty-label.component'

interface ExtraArgs {
  emptyLabelText?: string
}

const meta: Meta<WidgetEmptyLabelComponent & ExtraArgs> = {
  title: 'Widget/Components/Content/Empty Label',
  component: WidgetEmptyLabelComponent,
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
type Story = StoryObj<WidgetEmptyLabelComponent & ExtraArgs>

export const Basic: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-empty-label>{{ emptyLabelText }}</seam-widget-empty-label>
        </seam-widget>
      </div>`,
  }),
  args: {
    emptyLabelText: 'Empty Label Text',
  },
}
