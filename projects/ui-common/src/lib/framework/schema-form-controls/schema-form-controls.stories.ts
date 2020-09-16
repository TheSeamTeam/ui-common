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

export const Example2 = () => ({
  props: {
    schema: {
      '$id': 'http://example.com/example.json',
      'type': 'object',
      'definitions': {},
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'properties': {
        'Contract': {
          '$id': '/properties/SelfAssessmentSummary',
          'type': 'object',
          'properties': {
            'CropYear': {
              '$id': '/properties/SelfAssessmentSummary/properties/CropYear',
              'type': 'string',
              'title': 'Crop Year',
              'enum': [ 2020 ]
            },
            'Region': {
              '$id': '/properties/SelfAssessmentSummary/properties/Region',
              'type': 'integer',
              'title': 'Crop Year',
              'enum': [ 2020 ]
            },
            'IsIrrigated': {
              '$id': '/properties/SelfAssessmentSummary/properties/IsIrrigated',
              'type': 'boolean',
              'title': 'Irrigated'
            }
          },
          'required': [
            'CropYear',
            'Region'
          ]
        }
      }
    },
    layout: [
      { 'dataPointer': '/SelfAssessmentSummary/Seller/CropYear' },
      { 'dataPointer': '/SelfAssessmentSummary/Seller/Region' },
      { 'dataPointer': '/SelfAssessmentSummary/Seller/IsIrrigated' },
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
                },
                'MaxMicronaire': {
                  '$id': '/properties/Contract/properties/Seller/properties/MaxMicronaire',
                  'type': 'integer',
                  'title': 'Mic Max',
                  'default': 0,
                  'examples': [
                    49
                  ]
                },
                'Gender': {
                  '$id': '/properties/Contract/properties/Seller/properties/Gender',
                  'type': 'string',
                  'title': 'Gender',
                  'enum': [ 'male', 'female', 'alien' ]
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
      { 'dataPointer': '/Contract/Seller/MaxMicronaire' },
      { 'dataPointer': '/Contract/Seller/Gender' },
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
