import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetHeaderBadgeComponent } from './widget-header-badge.component'

export default {
  title: 'Widget/Components/Content/Header Badge',
  component: WidgetHeaderBadgeComponent,
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
      <seam-widget [icon]="icon" loading="false">
        <ng-template seamWidgetTitleTpl>
          {{ title }}
          <seam-widget-header-badge [theme]="badgeTheme">
            {{ headerBadgeText }}
          </seam-widget-header-badge>
        </ng-template>
      </seam-widget>
    </div>`
})
Basic.args = {
  title: 'Example Widget',
  headerBadgeText: 'Badge',
  badgeTheme: 'primary'
}
