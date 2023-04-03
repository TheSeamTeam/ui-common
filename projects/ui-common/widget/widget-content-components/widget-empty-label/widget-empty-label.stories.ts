import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { provideAnimations } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetEmptyLabelComponent } from './widget-empty-label.component'

export default {
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
} as Meta

export const Basic: Story = (args) => ({
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
})
Basic.args = {
  emptyLabelText: 'Empty Label Text',
}
