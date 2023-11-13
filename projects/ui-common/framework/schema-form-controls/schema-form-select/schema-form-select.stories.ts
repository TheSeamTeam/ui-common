import { Meta, StoryObj, applicationConfig, componentWrapperDecorator, moduleMetadata } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { JsonSchemaFormComponent } from '@ajsf/core'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'
import { getHarness } from '@theseam/ui-common/testing'
import { TheSeamSchemaFormSelectHarness } from './testing'
import { JsonSchemaFormHarness } from '../../schema-form/testing'

const meta: Meta<JsonSchemaFormComponent> = {
  title: 'Framework/Schema Form Controls/Select',
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
          'enum': [ 'Red', 'Green', 'Blue' ],
        },
      },
    },
    layout: [
      { 'dataPointer': '/Color' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfSelectHarness = await getHarness(TheSeamSchemaFormSelectHarness, { canvasElement, fixture })
    await expect(await sfSelectHarness.isRequired()).toBe(false)
    await expect(await sfSelectHarness.getValue()).toBe(null)
    await sfSelectHarness.clickOption({ value: 'Red' })
    await expect(await sfSelectHarness.getValue()).toBe('Red')
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Color: 'Red' })
  },
}

export const Required: Story = {
  args: {
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Color': {
          'type': 'string',
          'enum': [ 'Red', 'Green', 'Blue' ],
        },
      },
      'required': [
        'Color'
      ],
    },
    layout: [
      { 'dataPointer': '/Color' },
    ]
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfSelectHarness = await getHarness(TheSeamSchemaFormSelectHarness, { canvasElement, fixture })
    await expect(await sfSelectHarness.isRequired()).toBe(true)
    await expect(await sfSelectHarness.getValue()).toBe(null)
    await sfSelectHarness.clickOption({ value: 'Red' })
    await expect(await sfSelectHarness.getValue()).toBe('Red')
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Color: 'Red' })
  },
}
