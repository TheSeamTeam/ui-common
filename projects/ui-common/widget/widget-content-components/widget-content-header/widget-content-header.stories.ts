import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetContentHeaderComponent } from './widget-content-header.component'

export default {
  title: 'Widget/Components/Content/Content Header',
  component: WidgetContentHeaderComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule
      ]
    })
  ]
} as Meta

export const Basic: Story = (args) => ({
  props: {
    ...args,
    icon: faWrench
  },
  template: `
    <div class="p-1" style="max-height: 400px; width: 500px;">
      <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
        <seam-widget-content-header>{{ contentHeaderText }}</seam-widget-content-header>
      </seam-widget>
    </div>`
})
Basic.args = {
  contentHeaderText: 'Content Header Text'
}
