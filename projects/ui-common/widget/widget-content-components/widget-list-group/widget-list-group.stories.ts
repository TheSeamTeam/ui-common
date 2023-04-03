import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetListGroupItemComponent } from './widget-list-group-item/widget-list-group-item.component'

export default {
  title: 'Widget/Components/Content/List Group',
  component: WidgetListGroupItemComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
          RouterModule.forRoot([], { useHash: true }),
        ),
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
} as Meta

export const Basic: Story = (args) => ({
  props: {
    icon: faWrench,
    faEnvelope: faEnvelope,
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
})
