import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj, applicationConfig } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamIconModule } from '../icon.module'
import { IconNotificationComponent } from './icon-notification.component'

const meta: Meta<IconNotificationComponent> = {
  title: 'Icon/Components/Notification',
  component: IconNotificationComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamIconModule
      ]
    }),
    componentWrapperDecorator(story => `<seam-icon icon="assets/images/icons8-cotton-filled-48.png">${story}</seam-icon>`)
  ]
}

export default meta
type Story = StoryObj<IconNotificationComponent>

export const Basic: Story = {
  args: {
    iconClass: 'text-danger',
    // hasNotification: true
  },
}
