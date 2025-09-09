import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetDescriptionComponent } from './widget-description.component'

const meta: Meta<WidgetDescriptionComponent> = {
  title: 'Widget/Components/Content/Description',
  component: WidgetDescriptionComponent,
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
type Story = StoryObj<WidgetDescriptionComponent>

export const Basic: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-description>{{ descText }}</seam-widget-description>
        </seam-widget>
      </div>`,
  }),
  args: {
    descText: 'Anim eiusmod aliquip veniam anim est do. Pariatur officia dolore proident do ad et enim laborum voluptate reprehenderit. Aute voluptate irure deserunt do est dolore esse minim. Deserunt do enim ea esse duis velit id cillum sunt. Officia laboris incididunt esse elit laboris. Occaecat anim magna quis mollit occaecat ad quis proident laborum.',
  },
}
