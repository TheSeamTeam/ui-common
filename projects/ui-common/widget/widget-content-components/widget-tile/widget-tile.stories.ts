import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faPersonBooth, faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetTileComponent } from './widget-tile.component'

export default {
  title: 'Widget/Components/Content/Tile',
  component: WidgetTileComponent,
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

export const Link: Story = args => ({
  props: {
    ...args,
    icon: faWrench,
    tileIcon: faPersonBooth,
  },
  template: `
    <div class="p-1" style="max-height: 400px; width: 500px;">
      <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
        <a seam-widget-tile [icon]="tileIcon" routerLink="/data-tools">
          {{ tileText }}
        </a>
        <a seam-widget-tile [icon]="tileIcon" routerLink="/data-tools" disabled>
          {{ tileText }} [disabled]
        </a>
      </seam-widget>
    </div>`,
})
Link.args = {
  tileText: 'Tile Text',
}

export const Button: Story = args => ({
  props: {
    ...args,
    icon: faWrench,
    tileIcon: faPersonBooth,
  },
  template: `
    <div class="p-1" style="max-height: 400px; width: 500px;">
      <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
        <button seam-widget-tile [icon]="tileIcon">{{ tileText }}</button>
        <button seam-widget-tile [icon]="tileIcon" disabled>{{ tileText }} [disabled]</button>
      </seam-widget>
    </div>`,
})
Button.args = {
  tileText: 'Tile Text',
}

export const ButtonWithFooter: Story = args => ({
  props: {
    ...args,
    icon: faWrench,
    tileIcon: faPersonBooth,
  },
  template: `
    <div class="p-1" style="max-height: 400px; width: 500px;">
      <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
        <button seam-widget-tile [icon]="tileIcon">tile 1</button>
        <seam-widget-tile-group>
          <button seam-widget-tile [icon]="tileIcon">{{ tileText }}</button>
          <seam-widget-tile-footer>
            <button seam-widget-tile-footer-item>Item 1</button>
            <a seam-widget-tile-footer-item>Item 2</a>
            <a seam-widget-tile-footer-item href="https://theseamteam.github.io/ui-common">Item 3</a>
          </seam-widget-tile-footer>
        </seam-widget-tile-group>
      </seam-widget>
    </div>`,
})
ButtonWithFooter.args = {
  tileText: 'Tile Text',
}
