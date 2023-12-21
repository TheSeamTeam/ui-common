import { Meta, StoryObj, applicationConfig, componentWrapperDecorator, moduleMetadata } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { JsonSchemaFormComponent } from '@ajsf/core'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'
import { getHarness } from '@theseam/ui-common/testing'
// import { TheSeamSchemaFormSelectHarness } from './testing'
import { JsonSchemaFormHarness } from '../../schema-form/testing'
import { TheSeamSchemaFormTiledSelectHarness } from './testing/schema-form-tiled-select.harness'

const meta: Meta<JsonSchemaFormComponent> = {
  title: 'Framework/Schema Form Controls/Tiled Select',
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamSchemaFormModule,
        ReactiveFormsModule,
      ],
    }),
    componentWrapperDecorator(JsonSchemaFormComponent, ({ args }) => args),
  ],
  argTypes: {
    onSubmit: { action: 'onSubmit' },
  },
  args: {
    framework: 'seam-framework',
  },
}

export default meta
type Story = StoryObj<JsonSchemaFormComponent>

export const Basic: Story = {
  args: {
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Crop': {
          'type': 'string',
          'title': 'Crop',
        },
      },
    },
    layout: [
      {
        'dataPointer': '/Crop',
        'widget': 'tiled-select',
        'tiles': [
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
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfTiledSelectHarness = await getHarness(TheSeamSchemaFormTiledSelectHarness, { canvasElement, fixture })
    await expect(await sfTiledSelectHarness.isRequired()).toBe(false)
    await expect(await sfTiledSelectHarness.getValue()).toBe('')

    const cottonBtnElem = await (await sfTiledSelectHarness.getTileByName('cotton')).getButtonElement()
    await cottonBtnElem.click()
    await expect(await sfTiledSelectHarness.getValue()).toBe('cotton')
    const cornBtnElem = await (await sfTiledSelectHarness.getTileByName('corn')).getButtonElement()
    await cornBtnElem.click()
    await expect(await sfTiledSelectHarness.getValue()).toBe('corn')

    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Crop: 'corn' })
  },
}

export const Required: Story = {
  args: {
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Crop': {
          'type': 'string',
          'title': 'Crop',
        },
      },
      'required': [
        'Crop'
      ],
    },
    layout: [
      {
        'dataPointer': '/Crop',
        'widget': 'tiled-select',
        'tiles': [
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
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfTiledSelectHarness = await getHarness(TheSeamSchemaFormTiledSelectHarness, { canvasElement, fixture })
    await expect(await sfTiledSelectHarness.isRequired()).toBe(true)
    await expect(await sfTiledSelectHarness.getValue()).toBe('')

    const cottonBtnElem = await (await sfTiledSelectHarness.getTileByName('cotton')).getButtonElement()
    await cottonBtnElem.click()
    await expect(await sfTiledSelectHarness.getValue()).toBe('cotton')
    const cornBtnElem = await (await sfTiledSelectHarness.getTileByName('corn')).getButtonElement()
    await cornBtnElem.click()
    await expect(await sfTiledSelectHarness.getValue()).toBe('corn')

    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Crop: 'corn' })
  },
}
