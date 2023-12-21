import { Meta, StoryObj, applicationConfig, componentWrapperDecorator, moduleMetadata } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'
import { Injectable } from '@angular/core'

import { Framework, JsonSchemaFormComponent } from '@ajsf/core'

import { getHarness } from '@theseam/ui-common/testing'
import { THESEAM_SCHEMA_FRAMEWORK_OVERRIDES, TheSeamSchemaFormFrameworkComponent, extendFramework } from '@theseam/ui-common/framework'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'
import { TheSeamSchemaFormSubmitHarness } from './testing'
import { JsonSchemaFormHarness } from '../../schema-form/testing'
import { TheSeamSchemaFormSubmitComponent } from './schema-form-submit.component'
import { TheSeamSchemaFormSelectHarness } from '../schema-form-select/testing'

// TODO: Fix
// @Injectable()
// class StoryFramework extends Framework {
//   name = 'story-framework'

//   framework = TheSeamSchemaFormFrameworkComponent

//   widgets = {
//     'submit': TheSeamSchemaFormSubmitComponent,
//   }

//   constructor() {
//     super()
//     extendFramework(this, 'seam-framework')
//     console.log('StoryFramework', this)
//   }
// }

const meta: Meta<JsonSchemaFormComponent> = {
  title: 'Framework/Schema Form Controls/Submit',
  tags: [ 'autodocs' ],
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        // { provide: Framework, useClass: StoryFramework, multi: true },
        {
          provide: THESEAM_SCHEMA_FRAMEWORK_OVERRIDES,
          useValue: {
            widgets: {
              'submit': TheSeamSchemaFormSubmitComponent,
            }
          },
          multi: true,
        },
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
        'Color': {
          'type': 'string',
          'enum': [ 'red', 'green', 'blue' ],
          'enumNames': [ 'Red', 'Green', 'Blue' ],
        },
      },
      'required': [
        'Color',
      ],
    },
    layout: [
      { 'dataPointer': '/Color' },
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const sfSubmitHarness = await getHarness(TheSeamSchemaFormSubmitHarness, { canvasElement, fixture })
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
    await expect(args.onSubmit).toHaveBeenCalledWith({ Color: 'red' })
  },
}
