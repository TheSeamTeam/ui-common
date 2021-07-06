import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetButtonGroupComponent } from './widget-button-group.component'

export default {
  title: 'Widget/Components/Content/Button Group',
  component: WidgetButtonGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true }),
        TheSeamWidgetModule,
        TheSeamButtonsModule,
        TheSeamIconModule
      ]
    })
  ]
} as Meta

export const Basic: Story = () => ({
  props: {
    icon: faWrench,
    faEnvelope: faEnvelope
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
    </div>`
})
