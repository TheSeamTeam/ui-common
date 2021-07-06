import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamIconModule } from '../icon.module'
import { IconNotificationComponent } from './icon-notification.component'

export default {
  title: 'Icon/Components/Notification',
  component: IconNotificationComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        TheSeamIconModule
      ]
    }),
    componentWrapperDecorator(story => `<seam-icon icon="assets/images/icons8-cotton-filled-48.png">${story}</seam-icon>`)
  ]
} as Meta

export const Basic: Story = (args) => ({
  props: { ...args }
})
Basic.args = {
  iconClass: 'text-danger',
  hasNotification: true
}
