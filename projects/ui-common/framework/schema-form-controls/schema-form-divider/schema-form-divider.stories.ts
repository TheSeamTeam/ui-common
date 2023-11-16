import { applicationConfig, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { JsonSchemaFormComponent } from '@ajsf/core'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'

const meta: Meta<JsonSchemaFormComponent> = {
  title: 'Framework/Schema Form Controls/Divider',
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
        'One': {
          'type': 'boolean',
          'title': 'Checkbox One',
          'default': false,
        },
        'Two': {
          'type': 'string',
          'title': 'Input Two',
        },
      },
    },
    layout: [
      { 'dataPointer': '/One' },
      { 'type': 'divider', 'htmlClass': 'mx-4' },
      { 'dataPointer': '/Two' },
    ],
  },
}
