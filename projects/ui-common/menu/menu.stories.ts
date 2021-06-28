import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'

import { MenuComponent } from './menu.component'
import { TheSeamMenuModule } from './menu.module'

export default {
  title: 'Menu/Components',
  component: MenuComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamButtonsModule,
        TheSeamMenuModule
      ]
    })
  ]
} as Meta

export const Basic: Story = (args) => ({
  props: { ...args },
  template: `
    <div class="p-5">
      <seam-menu #menu>
        <button seamMenuItem>Item 1</button>
        <button seamMenuItem>Item 2</button>
        <button seamMenuItem>Item 3</button>
      </seam-menu>
      <button [seamMenuToggle]="menu" seamButton theme="primary" style="margin-left: 200px;">Toggle</button>
    </div>
  `
})
