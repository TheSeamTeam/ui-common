import { moduleMetadata } from '@storybook/angular'

import { ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'
import { TheSeamSchemaFormCheckboxComponent } from './schema-form-checkbox.component'

export default {
  title: 'Framework/Schema Form Controls/Checkbox',
  component: TheSeamSchemaFormCheckboxComponent,
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
        'Available': {
          '$id': '/properties/IsAvailable',
          'type': 'boolean',
          'title': 'Is Available',
          'default': false
        }
      }
    },
    layout: [
      { 'dataPointer': '/Available' }
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
        'Available': {
          '$id': '/properties/IsAvailable',
          'type': 'boolean',
          'title': 'Is Available',
          'default': false
        }
      },
      'required': [
        'Available'
      ]
    },
    layout: [
      { 'dataPointer': '/Available' }
    ]
  },
  template: `
    <json-schema-form
      framework="seam-framework"
      [schema]="schema"
      [layout]="layout">
    </json-schema-form>`
})
