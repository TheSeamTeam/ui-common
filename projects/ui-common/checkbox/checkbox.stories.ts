import { moduleMetadata, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { expectFn, getHarness } from '@theseam/ui-common/testing'

import { ComponentHarness } from '@angular/cdk/testing'
import { TheSeamCheckboxComponent } from './checkbox.component'
import { TheSeamCheckboxModule } from './checkbox.module'
import { TheSeamCheckboxHarness } from './testing/checkbox.harness'

export default {
  title: 'Checkbox/Components',
  component: TheSeamCheckboxComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamCheckboxModule
      ]
    })
  ],
  parameters: {
    docs: {
      iframeHeight: '40px',
    }
  }
}

export const Basic: Story<TheSeamCheckboxComponent> = ({ ...args }) => ({
  template: `<seam-checkbox>Checkbox</seam-checkbox>`
})
Basic.play = async ({ canvasElement, fixture }) => {
  const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
  await expectFn(await checkboxHarness.isChecked()).toBe(false)
}

export const Checked: Story<TheSeamCheckboxComponent> = ({ ...args }) => ({
  template: `<seam-checkbox [checked]="true">Initially checked.</seam-checkbox>`
})
Checked.play = async ({ canvasElement, fixture }) => {
  const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
  await expectFn(await checkboxHarness.isChecked()).toBe(true)
}

export const Unchecked: Story<TheSeamCheckboxComponent> = ({ ...args }) => ({
  template: `<seam-checkbox [checked]="false">Initially unchecked.</seam-checkbox>`
})
Unchecked.play = async ({ canvasElement, fixture }) => {
  const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
  await expectFn(await checkboxHarness.isChecked()).toBe(false)
}

export const Indeterminate: Story<TheSeamCheckboxComponent> = ({ ...args }) => ({
  template: `<seam-checkbox [indeterminate]="true">Initially indeterminate.</seam-checkbox>`
})
Indeterminate.play = async ({ canvasElement, fixture }) => {
  const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
  await expectFn(await checkboxHarness.isIndeterminate()).toBe(true)
}

export const Disabled: Story<TheSeamCheckboxComponent> = ({ ...args }) => ({
  template: `<seam-checkbox [disabled]="true">Example.</seam-checkbox>`
})
Disabled.play = async ({ canvasElement, fixture }) => {
  const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
  await expectFn(await checkboxHarness.isDisabled()).toBe(true)
}

export const ExampleToggling: Story<TheSeamCheckboxComponent> = ({ ...args }) => ({
  template: `<seam-checkbox>Toggling example.</seam-checkbox>`
})
ExampleToggling.play = async ({ canvasElement, fixture }) => {
  const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
  await expectFn(await checkboxHarness.isChecked()).toBe(false)
  await checkboxHarness.click()
  await expectFn(await checkboxHarness.isChecked()).toBe(true)
  await checkboxHarness.click()
  await expectFn(await checkboxHarness.isChecked()).toBe(false)
}

export const ExampleIndeterminateToggle: Story<TheSeamCheckboxComponent> = ({ ...args }) => ({
  template: `<seam-checkbox [indeterminate]="true">Indeterminate toggle example.</seam-checkbox>`
})
ExampleIndeterminateToggle.play = async ({ canvasElement, fixture }) => {
  const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
  await expectFn(await checkboxHarness.isChecked()).toBe(false)
  await expectFn(await checkboxHarness.isIndeterminate()).toBe(true)
  await checkboxHarness.click()
  await expectFn(await checkboxHarness.isChecked()).toBe(true)
  await expectFn(await checkboxHarness.isIndeterminate()).toBe(false)
  await checkboxHarness.click()
  await expectFn(await checkboxHarness.isChecked()).toBe(false)
  await expectFn(await checkboxHarness.isIndeterminate()).toBe(false)
}
