import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faPersonBooth, faPlusCircle, faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetTileListComponent } from './widget-tile-list.component'

export default {
  title: 'Widget/Components/Content/TileList',
  component: WidgetTileListComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true })
      ]
    })
  ]
} as Meta

export const Basic: Story = (args) => ({
  props: {
    ...args,
    icon: faWrench,
    icons: [ faPersonBooth, faWrench, faPersonBooth, faPlusCircle ]
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
    </div>`
})
