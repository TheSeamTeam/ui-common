import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import {
  faPersonBooth,
  faPlusCircle,
  faWrench,
} from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetTileListComponent } from './widget-tile-list.component'

const meta: Meta<WidgetTileListComponent> = {
  title: 'Widget/Components/Content/TileList',
  component: WidgetTileListComponent,
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
type Story = StoryObj<WidgetTileListComponent>

export const Basic: Story = {
  render: (args) => ({
    props: {
      ...args,
      icon: faWrench,
      icons: [faPersonBooth, faWrench, faPersonBooth, faPlusCircle],
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-tile-list>
            <a seam-widget-tile [icon]="icons[0]" routerLink="/data-tools" iconClass="text-info">Tile 1</a>
            <a seam-widget-tile [icon]="icons[1]" routerLink="/data-tools" iconClass="text-danger">Tile 2</a>
            <button seam-widget-tile [icon]="icons[2]" iconClass="text-warning">Tile 3</button>
            <seam-widget-tile-group>
              <a seam-widget-tile [icon]="icons[3]" routerLink="/data-tools" iconClass="text-success">Tile 4</a>
            </seam-widget-tile-group>
          </seam-widget-tile-list>
        </seam-widget>
      </div>`,
  }),
}
