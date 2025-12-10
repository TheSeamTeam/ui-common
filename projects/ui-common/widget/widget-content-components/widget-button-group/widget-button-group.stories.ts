import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetButtonGroupComponent } from './widget-button-group.component'

const meta: Meta<WidgetButtonGroupComponent> = {
  title: 'Widget/Components/Content/Button Group',
  component: WidgetButtonGroupComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideLocationMocks(),
        provideRouter([]),
      ],
    }),
    moduleMetadata({
      imports: [TheSeamWidgetModule, TheSeamButtonsModule, TheSeamIconModule],
    }),
  ],
}

export default meta
type Story = StoryObj<WidgetButtonGroupComponent>

export const Basic: Story = {
  render: (args) => ({
    props: {
      ...args,
      icon: faWrench,
      faEnvelope,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-button-group>
            <button seamButton theme="primary" size="sm">
              <seam-icon [icon]="faEnvelope"></seam-icon>
            </button>
          </seam-widget-button-group>
        </seam-widget>
      </div>`,
  }),
}
