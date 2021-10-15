import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamTiledSelectModule } from '../../tiled-select.module'
import { TheSeamTiledSelectComponent } from './tiled-select.component'

export default {
  title: 'Tiled Select/Components/Tiled Select',
  component: TheSeamTiledSelectComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        TheSeamTiledSelectModule
      ]
    }),
    componentWrapperDecorator(story => `<div style="width: 600px">${story}</div>`)
  ]
} as Meta

export const Default: Story<TheSeamTiledSelectComponent & { [key: string]: any }> = (args) => ({
  // props: { ...args },
  props: {
    tiles: args.tiles
  }
})
Default.args = {
  tiles: [
    {
      name: 'cotton',
      value: 'cotton',
      label: 'Cotton',
      icon: 'assets/images/icons8-cotton-filled-48.png',
      disabled: false
    },
    {
      name: 'peanuts',
      value: 'peanuts',
      label: 'Peanuts',
      icon: 'assets/images/icons8-cotton-filled-48.png',
      disabled: false
    },
    {
      name: 'soybeans',
      value: 'soybeans',
      label: 'Soybeans',
      icon: 'assets/images/icons8-cotton-filled-48.png',
      disabled: false
    },
    {
      name: 'wheat',
      value: 'wheat',
      label: 'Wheat',
      icon: 'assets/images/icons8-cotton-filled-48.png',
      disabled: false
    },
    {
      name: 'corn',
      value: 'corn',
      label: 'Corn',
      icon: 'assets/images/icons8-cotton-filled-48.png',
      disabled: false
    },
    {
      name: 'sorghum',
      value: 'sorghum',
      label: 'Sorghum',
      icon: 'assets/images/icons8-cotton-filled-48.png',
      disabled: false
    },
    {
      name: 'other',
      value: 'other',
      label: 'Other, unlisted',
      icon: 'assets/images/icons8-cotton-filled-48.png',
      disabled: false
    }
  ]
}
