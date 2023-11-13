import { Meta, StoryObj, applicationConfig, componentWrapperDecorator, moduleMetadata } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { JsonSchemaFormComponent } from '@ajsf/core'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'
import { TheSeamSchemaFormSubmitHarness } from './testing'
import { getHarness } from '@theseam/ui-common/testing'
import { JsonSchemaFormHarness } from '../../schema-form/testing'

const meta: Meta<JsonSchemaFormComponent> = {
  title: 'Framework/Schema Form Controls/Submit',
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
    onSubmit: { action: 'onSubmit' }
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
        'Colors': {
          'type': 'string',
          'enum': [ 'Red', 'Green', 'Blue' ],
        },
      },
    },
    layout: [
      { 'dataPointer': '/Colors' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfSubmitHarness = await getHarness(TheSeamSchemaFormSubmitHarness, { canvasElement, fixture })
    await expect(await sfSubmitHarness.isRequired()).toBe(false)
    await sfSubmitHarness.click()
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Colors: true })
  },
}

export const Required: Story = {
  args: {
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Colors': {
          'type': 'string',
          'enum': [ 'red', 'green', 'blue' ],
          'enumNames': [ 'Red', 'Green', 'Blue' ],
        },
        'Exporter': {
          'type': 'split-button',
          'title': 'Export',
          'hasSplitButton': true,
          'exporters': [ 'PDF', 'XLSX' ],
        }
      },
      'required': [
        'Exporter',
      ],
    },
    layout: [
      { 'dataPointer': '/Colors' },
      { 'dataPointer': '/Exporter' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfSubmitHarness = await getHarness(TheSeamSchemaFormSubmitHarness, { canvasElement, fixture })
    await expect(await sfSubmitHarness.isRequired()).toBe(true)
    await sfSubmitHarness.click()
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Colors: true })
  },
}
