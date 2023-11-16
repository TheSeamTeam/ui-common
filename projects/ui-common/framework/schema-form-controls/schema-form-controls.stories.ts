import { Meta, StoryObj, applicationConfig, componentWrapperDecorator, moduleMetadata } from '@storybook/angular'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { JsonSchemaFormComponent } from '@ajsf/core'

import { TheSeamSchemaFormModule } from '../schema-form/schema-form.module'

const meta: Meta<JsonSchemaFormComponent> = {
  title: 'Framework/Schema Form Controls/Examples',
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
    (storyFn, storyContext) => {
      const story = storyFn(storyContext)
      const _win = window as any
      _win.__schema = story.props?.schema
      _win.__layout = story.props?.layout
      _win.toCopyableStr = (json: any) => {
        return (JSON.stringify(json).toString() as any).replaceAll('"', '\\"')
      }
      return story
    }
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

export const Example: Story = {
  args: {
    options: {
      addSubmit: true, // Add a submit button if layout does not have one
      debug: false, // Don't show inline debugging information
    },
    schema: {
      '$id': 'http://example.com/example.json',
      'type': 'object',
      'definitions': {},
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'SelfAssessmentSummary': {
          '$id': '/properties/SelfAssessmentSummary',
          'type': 'object',
          'properties': {
            'CropYear': {
              '$id': '/properties/SelfAssessmentSummary/properties/CropYear',
              'type': 'number',
              'title': 'Crop Year',
              'enum': [ 2020 ]
            },
            'Region': {
              '$id': '/properties/SelfAssessmentSummary/properties/Region',
              'type': 'string',
              'title': 'Region',
              'enum': [ 'South West', 'North West', 'South East', 'North East' ]
            },
            'IsIrrigated': {
              '$id': '/properties/SelfAssessmentSummary/properties/IsIrrigated',
              'type': 'boolean',
              'title': 'Irrigated',
              'default': false
            }
          },
          'required': [
            'CropYear',
            'Region',
            'IsIrrigated'
          ]
        }
      }
    },
    layout: [
      { 'dataPointer': '/SelfAssessmentSummary/CropYear' },
      { 'dataPointer': '/SelfAssessmentSummary/Region' },
      { 'dataPointer': '/SelfAssessmentSummary/IsIrrigated' },
    ],
  },
}

export const Example2: Story = {
  args: {
    options: {
      addSubmit: true, // Add a submit button if layout does not have one
      debug: false, // Don't show inline debugging information
    },
    schema: {
      '$id': 'http://example.com/example.json',
      'type': 'object',
      'definitions': {},
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'SelfAssessmentSummary': {
          '$id': '/properties/SelfAssessmentSummary',
          'type': 'object',
          'properties': {
            'CropYear': {
              '$id': '/properties/SelfAssessmentSummary/properties/CropYear',
              'type': 'number',
              'title': 'Crop Year',
              'enum': [ 2020 ],
              'default': 2020
            },
            'Region': {
              '$id': '/properties/SelfAssessmentSummary/properties/Region',
              'type': 'string',
              'title': 'Region',
              'enum': [ 'Far West', 'Southwest', 'Midsouth', 'Southeast' ]
            },
            'IsIrrigated': {
              '$id': '/properties/SelfAssessmentSummary/properties/IsIrrigated',
              'type': 'boolean',
              'title': 'Irrigated',
              'default': false
            }
          },
          'required': [
            'CropYear',
            'Region',
            'IsIrrigated'
          ]
        }
      }
    },
    layout: [
      // { 'dataPointer': '/SelfAssessmentSummary/CropYear' },
      { 'dataPointer': '/SelfAssessmentSummary/Region' },
      { 'dataPointer': '/SelfAssessmentSummary/IsIrrigated' },
      { 'widget': 'submit', 'title': 'View' },
    ],
  },
}

export const Example3: Story = {
  args: {
    options: {
      addSubmit: true, // Add a submit button if layout does not have one
      debug: false, // Don't show inline debugging information
    },
    schema: {
      '$id': 'http://example.com/example.json',
      'type': 'object',
      'definitions': {},
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'title': 'Producers Progress',
      'properties': { }
    },
    layout: [
      // { 'dataPointer': '/SelfAssessmentSummary/CropYear' },
      // { 'dataPointer': '/SelfAssessmentSummary/Region' },
      // { 'dataPointer': '/SelfAssessmentSummary/IsIrrigated' },
      { 'widget': 'submit', 'title': 'View' },
    ],
  },
}

export const Example5: Story = {
  args: {
    options: {
      addSubmit: true, // Add a submit button if layout does not have one
      debug: false, // Don't show inline debugging information
    },
    schema: {
      '$id': 'http://example.com/example.json',
      'type': 'object',
      'definitions': {},
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'ApprovalStatus': {
          '$id': '/properties/ApprovalStatus',
          'type': 'string',
          'title': 'Approval Status',
          'default': 'All',
          'enum': [
            'All',
            'Approved',
            'Unapproved'
          ]
        }
      },
      'required': [
        'ApprovalStatus'
      ]
    },
    layout: [
      { 'dataPointer': '/ApprovalStatus' },
      { 'widget': 'submit', 'title': 'View' },
    ],
  },
}

export const Group: Story = {
  args: {
    options: {
      addSubmit: true, // Add a submit button if layout does not have one
      debug: false, // Don't show inline debugging information
    },
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'SelfAssessmentSummary': {
          'type': 'object',
          'properties': {
            'CropYear': {
              'type': 'number',
              'title': 'Crop Year',
              'enum': [ 2020 ]
            },
            'Region': {
              'type': 'string',
              'title': 'Region',
              'enum': [ 'South West', 'North West', 'South East', 'North East' ]
            },
            'IsIrrigated': {
              'type': 'boolean',
              'title': 'Irrigated',
              'default': false
            }
          },
          'required': [
            'CropYear',
            'Region',
            'IsIrrigated'
          ]
        }
      }
    },
    layout: [
      { 'dataPointer': '/SelfAssessmentSummary/CropYear' },
      {
        'type': 'section',
        'title': 'Section 1',
        'items': [
          { 'dataPointer': '/SelfAssessmentSummary/Region' },
          { 'dataPointer': '/SelfAssessmentSummary/IsIrrigated' },
        ],
      },
    ],
  },
}
