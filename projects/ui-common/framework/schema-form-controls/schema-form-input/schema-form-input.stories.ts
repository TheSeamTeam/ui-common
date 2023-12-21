import { applicationConfig, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { JsonSchemaFormComponent } from '@ajsf/core'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'
import { TheSeamSchemaFormInputHarness } from './testing/schema-form-input.harness'
import { JsonSchemaFormHarness } from '../../schema-form/testing'

const meta: Meta<JsonSchemaFormComponent> = {
  title: 'Framework/Schema Form Controls/Input',
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
        'Input': {
          'type': 'string',
          'title': 'Input',
        },
      },
    },
    layout: [
      { 'dataPointer': '/Input' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfInputHarness = await getHarness(TheSeamSchemaFormInputHarness, { canvasElement, fixture })
    await expect(await sfInputHarness.isRequired()).toBe(false)
    await expect(await sfInputHarness.hasRequiredIndicator()).toBe(false)
    await expect(await sfInputHarness.getValue()).toBe('')
    await sfInputHarness.setValue('Test')
    await expect(await sfInputHarness.getValue()).toBe('Test')
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Input: 'Test' })
  },
}

export const Required: Story = {
  args: {
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Input': {
          'type': 'string',
          'title': 'Input',
        },
      },
      'required': [
        'Input',
      ],
    },
    layout: [
      { 'dataPointer': '/Input' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfInputHarness = await getHarness(TheSeamSchemaFormInputHarness, { canvasElement, fixture })
    await expect(await sfInputHarness.isRequired()).toBe(true)
    await expect(await sfInputHarness.hasRequiredIndicator()).toBe(true)
    await expect(await sfInputHarness.getValue()).toBe('')
    await sfInputHarness.setValue('Test')
    await expect(await sfInputHarness.getValue()).toBe('Test')
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Input: 'Test' })
  },
}
