import { action } from '@storybook/addon-actions'
import { moduleMetadata } from '@storybook/angular'

import { ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'

export default {
  title: 'Framework/Schema Form Controls/Submit Split',
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamSchemaFormModule,
        ReactiveFormsModule
      ]
    })
  ]
}

export const Basic = () => ({
  props: {
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Colors': {
          'type': 'string',
          'enum': [ 'red', 'green', 'blue' ],
          'enumNames': [ 'Red', 'Green', 'Blue' ]
        },
        'ExportType': {
          'type': 'string',
          'enum': [ 'pdf', 'xlsx' ],
          'enumNames': [ 'PDF', 'XLSX' ],
          'default': 'xlsx'
        }
      },
      'required': [
        'Colors',
        'ExportType'
      ]
    },
    layout: [
      { 'dataPointer': '/Colors' },
      { 'type': 'submit', 'title': 'Generate' }
    ],
    _onSubmit: (e: any) => {
      // console.log('_onSubmit', e)
      action('onSubmit')(e)
    }
  },
  template: `
    <json-schema-form
      framework="seam-framework"
      [schema]="schema"
      [layout]="layout"
      (onSubmit)="_onSubmit($event)">
    </json-schema-form>`
})

export const SplitButton = () => ({
  props: {
    schema: {
      'type': 'object',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Colors': {
          'type': 'string',
          'enum': [ 'red', 'green', 'blue' ],
          'enumNames': [ 'Red', 'Green', 'Blue' ]
        },
        'ExportType': {
          'type': 'string',
          'enum': [ 'pdf', 'xlsx' ],
          'enumNames': [ 'PDF', 'XLSX' ],
          'default': 'xlsx'
        }
      },
      'required': [
        'Colors',
        'ExportType'
      ]
    },
    layout: [
      { 'dataPointer': '/Colors' },
      {
        'type': 'submit', 'title': 'Generate',
        'items': [
          { 'dataPointer': '/ExportType' }
        ]
      }
    ],
    _onSubmit: (e: any) => {
      // console.log('_onSubmit', e)
      action('onSubmit')(e)
    }
  },
  template: `
    <json-schema-form
      framework="seam-framework"
      [schema]="schema"
      [layout]="layout"
      (onSubmit)="_onSubmit($event)">
    </json-schema-form>`
})
