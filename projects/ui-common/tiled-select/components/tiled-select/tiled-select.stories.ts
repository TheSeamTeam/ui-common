import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/test'

import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamTiledSelectHarness } from './../../testing/tiled-select-harness'
import { TheSeamTiledSelectModule } from '../../tiled-select.module'
import { TheSeamTiledSelectComponent } from './tiled-select.component'

interface ExtraArgs {
  dt?: {
    columns: any[]
    rows: any[]
  }
}

type StoryComponentType = TheSeamTiledSelectComponent & ExtraArgs

const meta: Meta<StoryComponentType> = {
  title: 'Tiled Select/Components/Tiled Select',
  component: TheSeamTiledSelectComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        TheSeamTiledSelectModule,
      ]
    }),
    componentWrapperDecorator(story => `<div style="width: 600px">${story}</div>`)
  ]
}

export default meta
type Story = StoryObj<StoryComponentType>

export const Default: Story = {
  render: args => ({
    props: args,
    template: `<seam-tiled-select [tiles]="tiles"></seam-tiled-select>`,
  }),
  args: {
    tiles: [
      {
        name: 'cotton',
        value: 'cotton',
        label: 'Cotton',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'peanuts',
        value: 'peanuts',
        label: 'Peanuts',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'soybeans',
        value: 'soybeans',
        label: 'Soybeans',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'wheat',
        value: 'wheat',
        label: 'Wheat',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'corn',
        value: 'corn',
        label: 'Corn',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'sorghum',
        value: 'sorghum',
        label: 'Sorghum',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'other',
        value: 'other',
        label: 'Other, unlisted',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
    ],
  },
  play: async ({ canvasElement, fixture }) => {
    const tiledSelectHarness = await getHarness(TheSeamTiledSelectHarness, { canvasElement, fixture })
    const cottonBtnElem = await (await tiledSelectHarness.getTileByName('cotton')).getButtonElement()
    await cottonBtnElem.click()
    await expect(await tiledSelectHarness.getValue()).toBe('cotton')
    const cornBtnElem = await (await tiledSelectHarness.getTileByName('corn')).getButtonElement()
    await cornBtnElem.click()
    await expect(await tiledSelectHarness.getValue()).toBe('corn')
  },
}

export const WithControl: StoryObj<TheSeamTiledSelectComponent & { [key: string]: any }> = {
  render: args => ({
    moduleMetadata: {
      imports: [ ReactiveFormsModule ],
    },
    props: {
      ...args,
      control: new UntypedFormControl(),
    },
    template: `<seam-tiled-select [tiles]="tiles" [formControl]="control"></seam-tiled-select>`,
  }),
  args: {
    tiles: [
      {
        name: 'cotton',
        value: 'cotton',
        label: 'Cotton',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'peanuts',
        value: 'peanuts',
        label: 'Peanuts',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'soybeans',
        value: 'soybeans',
        label: 'Soybeans',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'wheat',
        value: 'wheat',
        label: 'Wheat',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'corn',
        value: 'corn',
        label: 'Corn',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'sorghum',
        value: 'sorghum',
        label: 'Sorghum',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      },
      {
        name: 'other',
        value: 'other',
        label: 'Other, unlisted',
        icon: 'assets/images/icons8-cotton-filled-48.png',
        disabled: false,
      }
    ],
  },
  play: async ({ canvasElement, fixture }) => {
    const tiledSelectHarness = await getHarness(TheSeamTiledSelectHarness, { canvasElement, fixture })
    const cottonBtnElem = await (await tiledSelectHarness.getTileByName('cotton')).getButtonElement()
    await cottonBtnElem.click()
    await expect(await tiledSelectHarness.getValue()).toBe('cotton')
    const cornBtnElem = await (await tiledSelectHarness.getTileByName('corn')).getButtonElement()
    await cornBtnElem.click()
    await expect(await tiledSelectHarness.getValue()).toBe('corn')
  },
}
