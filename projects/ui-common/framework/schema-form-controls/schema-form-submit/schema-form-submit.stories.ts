import { action } from '@storybook/addon-actions'
import { moduleMetadata } from '@storybook/angular'

import { ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'

export default {
  title: 'Framework/Schema Form Controls/Submit',
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
      '$id': 'http://example.com/example.json',
      'type': 'object',
      'definitions': {},
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Colors': {
          '$id': '/properties/Colors',
          'type': 'string',
          'enum': [ 'Red', 'Green', 'Blue' ]
        }
      }
    },
    layout: [
      { 'dataPointer': '/Colors' }
    ]
  },
  template: `
    <json-schema-form
      framework="seam-framework"
      [schema]="schema"
      [layout]="layout">
    </json-schema-form>`
})

export const Required = () => ({
  props: {
    schema: {
      '$id': 'http://example.com/example.json',
      'type': 'object',
      'definitions': {},
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Colors': {
          '$id': '/properties/Colors',
          'type': 'string',
          'enum': [ 'red', 'green', 'blue' ],
          'enumNames': [ 'Red', 'Green', 'Blue' ]
        },
        'Exporter': {
          '$id': '/properties/Exporter',
          'type': 'split-button',
          'title': 'Export',
          'hasSplitButton': true,
          'exporters': [ 'PDF', 'XLSX' ]
        }
      },
      'required': [
        'Available'
      ]
    },
    layout: [
      { 'dataPointer': '/Colors' },
      { 'dataPointer': '/Exporter' }
    ],
    _onSubmit: (e: any) => {
      console.log('_onSubmit', e)
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
