import { action } from '@storybook/addon-actions'
import { moduleMetadata } from '@storybook/angular'

import { ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamSchemaFormModule } from '../schema-form/schema-form.module'

export default {
  title: 'Framework/SchemaForm',
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
    jsonFormObject: {},
    jsonFormOptions: {
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
    submitAction: action('submit')
  },
  template: `
    <json-schema-form
      framework="seam-framework"
      [form]="jsonFormObject"
      [options]="jsonFormOptions"
      [schema]="schema"
      [layout]="layout"
      (onSubmit)="submitAction($event)">
    </json-schema-form>`
})

function toCopyableStr(json) {
  return (JSON.stringify(json).toString() as any).replaceAll('"', '\\"')
}
const win = window as any
win.toCopyableStr = toCopyableStr

export const Example2 = () => {
  const schema = {
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
  }

  const layout = [
    // { 'dataPointer': '/SelfAssessmentSummary/CropYear' },
    { 'dataPointer': '/SelfAssessmentSummary/Region' },
    { 'dataPointer': '/SelfAssessmentSummary/IsIrrigated' },
    { 'widget': 'submit', 'title': 'View' },
  ]

  win.__schema = schema
  win.__layout = layout

  return {
    props: {
      jsonFormObject: {},
      jsonFormOptions: {
        addSubmit: true, // Add a submit button if layout does not have one
        debug: false, // Don't show inline debugging information
      },
      schema,
      layout,
      submitAction: action('submit')
    },
    template: `
      <json-schema-form
        framework="seam-framework"
        [form]="jsonFormObject"
        [options]="jsonFormOptions"
        [schema]="schema"
        [layout]="layout"
        (onSubmit)="submitAction($event)">
      </json-schema-form>`
  }
}

export const Example3 = () => {
  const schema = {
    '$id': 'http://example.com/example.json',
    'type': 'object',
    'definitions': {},
    '$schema': 'http://json-schema.org/draft-07/schema#',
    'title': 'Producers Progress',
    'properties': { }
  }

  const layout = [
    // { 'dataPointer': '/SelfAssessmentSummary/CropYear' },
    // { 'dataPointer': '/SelfAssessmentSummary/Region' },
    // { 'dataPointer': '/SelfAssessmentSummary/IsIrrigated' },
    { 'widget': 'submit', 'title': 'View' },
  ]

  win.__schema = schema
  win.__layout = layout

  return {
    props: {
      jsonFormObject: {},
      jsonFormOptions: {
        addSubmit: true, // Add a submit button if layout does not have one
        debug: false, // Don't show inline debugging information
      },
      schema,
      layout,
      submitAction: action('submit')
    },
    template: `
      <json-schema-form
        framework="seam-framework"
        [form]="jsonFormObject"
        [options]="jsonFormOptions"
        [schema]="schema"
        [layout]="layout"
        (onSubmit)="submitAction($event)">
      </json-schema-form>`
  }
}

