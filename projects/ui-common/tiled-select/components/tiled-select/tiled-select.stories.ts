import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { TheSeamTiledSelectModule } from '../../tiled-select.module'
import { TheSeamTiledSelectComponent } from './tiled-select.component'

import { expect } from '@storybook/jest'
import {
  userEvent,
  within
} from '@storybook/testing-library'

// import userEvent from '@testing-library/user-event'

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
  },
  template: `<seam-tiled-select [tiles]="tiles"></seam-tiled-select>`,
  // play: async () => {
  //   const input = await screen.getByAltText('sb-input');
  //   await userEvent.type(input, `Typing from CSF3`);
  // }

  // // @ts-ignore
  // // tslint:disable-next-line: no-shadowed-variable
  // play: async ({ args, canvasElement }) => {
  //   const canvas = within(canvasElement)
  //   await userEvent.click(canvas.getByTitle('Cotton'))
  //   // await expect(args.onClick).toHaveBeenCalled()
  //   await expect(canvasElement.value).toBe('cotton')
  // }
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
// @ts-ignore
// tslint:disable-next-line: no-shadowed-variable
Default.play = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement)
  const tile = canvas.getByTestId('cotton')
  console.log('tile', tile)
  await userEvent.click(tile)
  // await expect(args.onClick).toHaveBeenCalled()
  // await expect(canvasElement.value).toBe('cotton')
}

export const WithControl: Story<TheSeamTiledSelectComponent & { [key: string]: any }> = (args) => ({
  moduleMetadata: {
    imports: [ ReactiveFormsModule ]
  },
  // props: { ...args },
  props: {
    tiles: args.tiles,
    control: new FormControl()
  },
  template: `<seam-tiled-select [tiles]="tiles" [formControl]="control"></seam-tiled-select>`
})
WithControl.args = {
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
// @ts-ignore
// tslint:disable-next-line: no-shadowed-variable
WithControl.play = async ({ args, canvasElement }) => {
  console.log('canvasElement', canvasElement)
  const canvas = within(canvasElement)
  // console.log('item', canvas.getByTestId('cotton'))
  // await userEvent.click(canvas.getByTestId('cotton'))
  const tile = canvas.getByTestId('cotton')
  console.log('tile', tile)
  await userEvent.tab()
  await userEvent.click(tile, { button: 0 })
  // await expect(args.onClick).toHaveBeenCalled()
  await expect((canvas.getByTestId('tiled-select') as any).value).toBe('cotton')
}
