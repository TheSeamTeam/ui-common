import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetFooterLinkComponent } from './widget-footer-link.component'

export default {
  title: 'Widget/Components/Content/Footer Link',
  component: WidgetFooterLinkComponent,
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
      ],
    }),
  ],
} as Meta

export const Basic: Story = (args) => ({
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
})
Basic.args = {
  footerText: 'See All',
}
