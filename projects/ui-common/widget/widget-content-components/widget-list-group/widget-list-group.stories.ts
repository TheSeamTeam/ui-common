import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetListGroupItemComponent } from './widget-list-group-item/widget-list-group-item.component'

const meta: Meta<WidgetListGroupItemComponent> = {
  title: 'Widget/Components/Content/List Group',
  component: WidgetListGroupItemComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideLocationMocks(),
        provideRouter([]),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamWidgetModule,
        TheSeamButtonsModule,
        TheSeamIconModule,
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<WidgetListGroupItemComponent>

export const Basic: Story = {
  render: args => ({
    props: {
      icon: faWrench,
      faEnvelope,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-list-group>
            <seam-widget-list-group-item>Item 1</seam-widget-list-group-item>
            <seam-widget-list-group-item>Item 2</seam-widget-list-group-item>
            <seam-widget-list-group-item>Item 3</seam-widget-list-group-item>
          </seam-widget-list-group>
        </seam-widget>
      </div>`,
  }),
}
