import { moduleMetadata, Story } from '@storybook/angular'

import { ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { expectFn, getHarness } from '@theseam/ui-common/testing'

import { TheSeamSchemaFormModule } from '../../schema-form/schema-form.module'
import { TheSeamSchemaFormCheckboxComponent } from './schema-form-checkbox.component'
import { TheSeamSchemaFormCheckboxHarness } from './testing/schema-form-checkbox.harness'

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

export const Basic: Story<TheSeamSchemaFormCheckboxComponent> = () => ({
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
Basic.play = async ({ canvasElement, fixture }) => {
  const sfCheckboxHarness = await getHarness(TheSeamSchemaFormCheckboxHarness, { canvasElement, fixture })
  await expectFn(await sfCheckboxHarness.isRequired()).toBe(false)
  await expectFn(await sfCheckboxHarness.hasRequiredIndicator()).toBe(false)
  await expectFn(await sfCheckboxHarness.getValue()).toBe(false)
  await sfCheckboxHarness.click()
  await expectFn(await sfCheckboxHarness.getValue()).toBe(true)
}

export const Required: Story<TheSeamSchemaFormCheckboxComponent> = () => ({
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
Required.play = async ({ canvasElement, fixture }) => {
  const sfCheckboxHarness = await getHarness(TheSeamSchemaFormCheckboxHarness, { canvasElement, fixture })
  await expectFn(await sfCheckboxHarness.isRequired()).toBe(true)
  await expectFn(await sfCheckboxHarness.hasRequiredIndicator()).toBe(true)
  await expectFn(await sfCheckboxHarness.getValue()).toBe(false)
  await sfCheckboxHarness.click()
  await expectFn(await sfCheckboxHarness.getValue()).toBe(true)
}
