import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { provideAnimations } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetHeaderBadgeComponent } from './widget-header-badge.component'

export default {
  title: 'Widget/Components/Content/Header Badge',
  component: WidgetHeaderBadgeComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamWidgetModule,
      ],
    }),
  ],
} as Meta

export const Basic: Story = args => ({
  props: {
    ...args,
    icon: faWrench,
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
    </div>`,
})
Basic.args = {
  title: 'Example Widget',
  headerBadgeText: 'Badge',
  badgeTheme: 'primary',
}
