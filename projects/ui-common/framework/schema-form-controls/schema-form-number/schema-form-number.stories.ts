import { applicationConfig, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { JsonSchemaFormComponent } from '@ajsf/core'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'
import { TheSeamSchemaFormNumberHarness } from './testing/schema-form-number.harness'
import { JsonSchemaFormHarness } from '../../schema-form/testing'

const meta: Meta<JsonSchemaFormComponent> = {
  title: 'Framework/Schema Form Controls/Number',
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
        'Number': {
          'type': 'number',
          'title': 'Number',
        },
      },
    },
    layout: [
      { 'dataPointer': '/Number' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfNumberHarness = await getHarness(TheSeamSchemaFormNumberHarness, { canvasElement, fixture })
    await expect(await sfNumberHarness.isRequired()).toBe(false)
    await expect(await sfNumberHarness.hasRequiredIndicator()).toBe(false)
    await expect(await sfNumberHarness.getValue()).toBe('')
    await sfNumberHarness.setValue('123')
    await expect(await sfNumberHarness.getValue()).toBe('123')
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Number: 123 })
  },
}

export const Required: Story = {
  args: {
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Number': {
          'type': 'number',
          'title': 'Number',
        },
      },
      'required': [
        'Number',
      ],
    },
    layout: [
      { 'dataPointer': '/Number' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfNumberHarness = await getHarness(TheSeamSchemaFormNumberHarness, { canvasElement, fixture })
    await expect(await sfNumberHarness.isRequired()).toBe(true)
    await expect(await sfNumberHarness.hasRequiredIndicator()).toBe(true)
    await expect(await sfNumberHarness.getValue()).toBe('')
    await sfNumberHarness.setValue('123')
    await expect(await sfNumberHarness.getValue()).toBe('123')
    const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    await sfFormHarness.submit()
    await expect(args.onSubmit).toHaveBeenCalledWith({ Number: 123 })
  },
}
