import { Meta, StoryObj, applicationConfig, componentWrapperDecorator, moduleMetadata } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'
import { JsonSchemaFormComponent } from '@ajsf/core'
import { getHarness } from '@theseam/ui-common/testing'
import { TheSeamSchemaFormSubmitSplitHarness } from './testing'
import { JsonSchemaFormHarness } from '../../schema-form/testing'
import { TheSeamSchemaFormSelectHarness } from '../schema-form-select/testing'

const meta: Meta<JsonSchemaFormComponent> = {
  title: 'Framework/Schema Form Controls/Submit Split',
  tags: [ 'autodocs' ],
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
        'Color': {
          'type': 'string',
          'enum': [ 'red', 'green', 'blue' ],
          'enumNames': [ 'Red', 'Green', 'Blue' ],
        },
        'ExportType': {
          'type': 'string',
          'enum': [ 'pdf', 'xlsx' ],
          'enumNames': [ 'PDF', 'XLSX' ],
          'default': 'xlsx',
        },
      },
      'required': [
        'Color',
        'ExportType',
      ],
    },
    layout: [
      { 'dataPointer': '/Color' },
      { 'type': 'submit', 'title': 'Generate' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfSubmitHarness = await getHarness(TheSeamSchemaFormSubmitSplitHarness, { canvasElement, fixture })
    await expect(await sfSubmitHarness.isDisabled()).toBe(true)

    const sfSelectHarness = await getHarness(TheSeamSchemaFormSelectHarness, { canvasElement, fixture })
    await expect(await sfSelectHarness.isRequired()).toBe(true)
    await expect(await sfSelectHarness.getValue()).toBe(null)
    await sfSelectHarness.clickOption({ value: 'Red' })
    await expect(await sfSelectHarness.getValue()).toBe('Red')

    await expect(await sfSubmitHarness.isDisabled()).toBe(false)
    await sfSubmitHarness.click()
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Color: 'red', ExportType: 'xlsx' })
  },
}

export const SplitButton: Story = {
  args: {
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Color': {
          'type': 'string',
          'enum': [ 'red', 'green', 'blue' ],
          'enumNames': [ 'Red', 'Green', 'Blue' ],
        },
        'ExportType': {
          'type': 'string',
          'enum': [ 'pdf', 'xlsx' ],
          'enumNames': [ 'PDF', 'XLSX' ],
          'default': 'xlsx',
        },
      },
      'required': [
        'Color',
        'ExportType',
      ],
    },
    layout: [
      { 'dataPointer': '/Color' },
      {
        'type': 'submit', 'title': 'Generate',
        'items': [
          { 'dataPointer': '/ExportType' },
        ],
      },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfSubmitHarness = await getHarness(TheSeamSchemaFormSubmitSplitHarness, { canvasElement, fixture })
    await expect(await sfSubmitHarness.isDisabled()).toBe(true)

    const sfSelectHarness = await getHarness(TheSeamSchemaFormSelectHarness, { canvasElement, fixture })
    await expect(await sfSelectHarness.isRequired()).toBe(true)
    await expect(await sfSelectHarness.getValue()).toBe(null)
    await sfSelectHarness.clickOption({ value: 'Red' })
    await expect(await sfSelectHarness.getValue()).toBe('Red')

    await expect(await sfSubmitHarness.isDisabled()).toBe(false)
    await sfSubmitHarness.click()
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Color: 'red', ExportType: 'xlsx' })
  },
}
