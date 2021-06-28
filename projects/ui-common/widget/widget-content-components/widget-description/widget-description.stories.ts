import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetDescriptionComponent } from './widget-description.component'

export default {
  title: 'Widget/Components/Content/Description',
  component: WidgetDescriptionComponent,
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
    icon: faWrench,
    // // tslint:disable-next-line:max-line-length
  },
  template: `
    <div class="p-1" style="max-height: 400px; width: 500px;">
      <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
        <seam-widget-description>{{ descText }}</seam-widget-description>
      </seam-widget>
    </div>`
})
Basic.args = {
  descText: 'Anim eiusmod aliquip veniam anim est do. Pariatur officia dolore proident do ad et enim laborum voluptate reprehenderit. Aute voluptate irure deserunt do est dolore esse minim. Deserunt do enim ea esse duis velit id cillum sunt. Officia laboris incididunt esse elit laboris. Occaecat anim magna quis mollit occaecat ad quis proident laborum.'
}
