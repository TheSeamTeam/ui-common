import { moduleMetadata } from '@storybook/angular'

import { ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'

export default {
  title: 'Framework/SchemaFormControls/Select',
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
      { 'dataPointer': '/Colors' },
      { 'type': 'submit', 'title': 'Submit' }
    ]
  },
  template: `
    <json-schema-form
      framework="seam-framework"
      [schema]="schema"
      [layout]="layout">
    </json-schema-form>`
})
