import { applicationConfig, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { JsonSchemaFormComponent } from '@ajsf/core'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'
import { TheSeamSchemaFormCheckboxHarness } from './testing/schema-form-checkbox.harness'
import { JsonSchemaFormHarness } from '../../schema-form/testing'

const meta: Meta<JsonSchemaFormComponent> = {
  title: 'Framework/Schema Form Controls/Checkbox',
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
        'Available': {
          'type': 'boolean',
          'title': 'Is Available',
          'default': false,
        },
      },
    },
    layout: [
      { 'dataPointer': '/Available' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfCheckboxHarness = await getHarness(TheSeamSchemaFormCheckboxHarness, { canvasElement, fixture })
    await expect(await sfCheckboxHarness.isRequired()).toBe(false)
    await expect(await sfCheckboxHarness.hasRequiredIndicator()).toBe(false)
    await expect(await sfCheckboxHarness.getValue()).toBe(false)
    await sfCheckboxHarness.click()
    await expect(await sfCheckboxHarness.getValue()).toBe(true)
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Available: true })
  },
}

export const Required: Story = {
  args: {
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Available': {
          'type': 'boolean',
          'title': 'Is Available',
          'default': false,
        },
      },
      'required': [
        'Available',
      ],
    },
    layout: [
      { 'dataPointer': '/Available' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfCheckboxHarness = await getHarness(TheSeamSchemaFormCheckboxHarness, { canvasElement, fixture })
    await expect(await sfCheckboxHarness.isRequired()).toBe(true)
    await expect(await sfCheckboxHarness.hasRequiredIndicator()).toBe(true)
    await expect(await sfCheckboxHarness.getValue()).toBe(false)
    await sfCheckboxHarness.click()
    await expect(await sfCheckboxHarness.getValue()).toBe(true)
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Available: true })
  },
}
