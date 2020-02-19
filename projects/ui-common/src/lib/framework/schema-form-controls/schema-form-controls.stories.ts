import { moduleMetadata } from '@storybook/angular'

import { ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamSchemaFormControlsModule } from './schema-form-controls.module'

import { TheSeamSchemaFormModule } from '../schema-form/schema-form.module'
import { TheSeamSchemaFormCheckboxComponent } from './schema-form-checkbox/schema-form-checkbox.component'
import { TheSeamSchemaFormSubmitComponent } from './schema-form-submit/schema-form-submit.component'

export default {
  title: 'Framework/SchemaFormControls',
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

export const Example = () => ({
  props: {
    schema: {
      '$id': 'http://example.com/example.json',
      'type': 'object',
      'definitions': {},
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Contract': {
          '$id': '/properties/Contract',
          'type': 'object',
          'properties': {
            'Seller': {
              '$id': '/properties/Contract/properties/Seller',
              'type': 'object',
              'properties': {
                'Name': {
                  '$id': '/properties/Contract/properties/Seller/properties/Name',
                  'type': 'string',
                  'title': 'Company Name',
                  'default': '',
                  'examples': [
                    'Seller name'
                  ]
                },
                'Available': {
                  '$id': '/properties/Contract/properties/Seller/properties/Available',
                  'type': 'boolean',
                  'title': 'Available',
                  'default': false
                },
                'Email': {
                  '$id': '/properties/Contract/properties/Seller/properties/Email',
                  'type': 'string',
                  'title': 'Email',
                  'default': '',
                  'examples': [
                    'test@example.com'
                  ]
                },
                'Telephone': {
                  '$id': '/properties/Contract/properties/Seller/properties/Telephone',
                  'type': 'string',
                  'title': 'Telephone',
                  'default': '',
                  'examples': [
                    '901-555-5555'
                  ]
                },
                'Fax': {
                  '$id': '/properties/Contract/properties/Seller/properties/Fax',
                  'type': 'string',
                  'title': 'Fax',
                  'default': '',
                  'examples': [
                    '555-555-5555'
                  ]
                }
              },
              'required': [
                'Name'
              ]
            }
          }
        }
      }
    },
    layout: [
      { 'dataPointer': '/Contract/Seller/Name' },
      { 'dataPointer': '/Contract/Seller/Available' },
      { 'dataPointer': '/Contract/Seller/Email' },
      { 'dataPointer': '/Contract/Seller/Telephone' },
      { 'dataPointer': '/Contract/Seller/Fax' },
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
