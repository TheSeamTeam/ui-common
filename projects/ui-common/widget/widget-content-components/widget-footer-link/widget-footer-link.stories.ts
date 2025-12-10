import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetFooterLinkComponent } from './widget-footer-link.component'

const meta: Meta<WidgetFooterLinkComponent> = {
  title: 'Widget/Components/Content/Footer Link',
  component: WidgetFooterLinkComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideLocationMocks(),
        provideRouter([]),
      ],
    }),
    moduleMetadata({
      imports: [TheSeamWidgetModule],
    }),
  ],
}

export default meta
type Story = StoryObj<WidgetFooterLinkComponent>

export const Basic: Story = {
  render: (args) => ({
    props: {
      ...args,
      icon: faWrench,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <a seam-widget-footer-link routerLink="/messages">{{ footerText }}</a>
        </seam-widget>
      </div>`,
  }),
  args: {
    footerText: 'See All',
  },
}
