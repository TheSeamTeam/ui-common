import { applicationConfig, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { JsonSchemaFormComponent } from '@ajsf/core'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'
import { TheSeamSchemaFormTelHarness } from './testing/schema-form-tel.harness'
import { JsonSchemaFormHarness } from '../../schema-form/testing'

const meta: Meta<JsonSchemaFormComponent> = {
  title: 'Framework/Schema Form Controls/Tel',
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
        'TelNumber': {
          'type': 'string',
          'title': 'Phone Number',
          'default': '+1 901-555-5555',
        },
      },
    },
    layout: [
      { 'dataPointer': '/TelNumber', widget: 'tel' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfTelHarness = await getHarness(TheSeamSchemaFormTelHarness, { canvasElement, fixture })
    await expect(await sfTelHarness.isRequired()).toBe(false)
    await expect(await sfTelHarness.hasRequiredIndicator()).toBe(false)
    await expect(await sfTelHarness.getValue()).toBe('+1 901-555-5555')
    await sfTelHarness.setValue('+19015555556')
    await expect(await sfTelHarness.getValue()).toBe('+1 901-555-5556')
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ TelNumber: '+19015555556' })
  },
}

export const Required: Story = {
  args: {
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'TelNumber': {
          'type': 'string',
          'title': 'Phone Number',
          'default': '+1 901-555-5555',
        },
      },
      'required': [
        'TelNumber',
      ],
    },
    layout: [
      { 'dataPointer': '/TelNumber', widget: 'tel' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfTelHarness = await getHarness(TheSeamSchemaFormTelHarness, { canvasElement, fixture })
    await expect(await sfTelHarness.isRequired()).toBe(true)
    await expect(await sfTelHarness.hasRequiredIndicator()).toBe(true)
    await expect(await sfTelHarness.getValue()).toBe('+1 901-555-5555')
    await sfTelHarness.setValue('+1 901-555-5556')
    await expect(await sfTelHarness.getValue()).toBe('+1 901-555-5556')
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ TelNumber: '+19015555556' })
  },
}
