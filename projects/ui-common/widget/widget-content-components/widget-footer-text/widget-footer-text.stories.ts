import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetFooterTextComponent } from './widget-footer-text.component'

export default {
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
} as Meta

export const Basic: Story = args => ({
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
})
Basic.args = {
  footerText: 'Footer Text',
}
