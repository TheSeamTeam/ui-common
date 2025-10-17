import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { faPersonBooth, faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetTileComponent } from './widget-tile.component'

interface ExtraArgs {
  tileText?: string
}

const meta: Meta<WidgetTileComponent & ExtraArgs> = {
  title: 'Widget/Components/Content/Tile',
  component: WidgetTileComponent,
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
type Story = StoryObj<WidgetTileComponent & ExtraArgs>

export const Link: Story = {
  render: (args) => ({
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
  }),
  args: {
    tileText: 'Tile Text',
  },
}

export const Button: Story = {
  render: (args) => ({
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
  }),
  args: {
    tileText: 'Tile Text',
  },
}

export const ButtonWithFooter: Story = {
  render: (args) => ({
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
  }),
  args: {
    tileText: 'Tile Text',
  },
}
