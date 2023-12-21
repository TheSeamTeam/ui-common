import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { expectFn, getHarness } from '@theseam/ui-common/testing'
import { ArgsTplOptions, argsToTpl } from '@theseam/ui-common/story-helpers'

import { TheSeamCheckboxComponent } from './checkbox.component'
import { TheSeamCheckboxHarness } from './testing/checkbox.harness'
import { FormControl, ReactiveFormsModule } from '@angular/forms'

interface ExtraArgs {
  ngContent: string
}
type StoryComponentType = TheSeamCheckboxComponent & ExtraArgs

const meta: Meta<StoryComponentType> = {
  title: 'Checkbox/Components',
  tags: [ 'autodocs' ],
  component: TheSeamCheckboxComponent,
  render: args => ({
    props: args,
    template: `<seam-checkbox ${argsToTpl()}>{{ngContent}}</seam-checkbox>`
  }),
  parameters: {
    docs: {
      iframeHeight: '40px',
    },
    argsToTplOptions: {
      exclude: [
        'ngContent',
      ],
    } satisfies ArgsTplOptions,
  },
}

export default meta
type Story = StoryObj<StoryComponentType>

export const Basic: Story = {
  args: {
    ngContent: 'Checkbox',
  },
  play: async ({ canvasElement, fixture }) => {
    const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
    await expectFn(await checkboxHarness.isChecked()).toBe(false)
  },
}

export const Checked: Story = {
  args: {
    ngContent: 'Initially checked.',
    checked: true,
  },
  play: async ({ canvasElement, fixture }) => {
    const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
    await expectFn(await checkboxHarness.isChecked()).toBe(true)
  },
}

export const Unchecked: Story = {
  args: {
    ngContent: 'Initially unchecked.',
    checked: false,
  },
  play: async ({ canvasElement, fixture }) => {
    const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
    await expectFn(await checkboxHarness.isChecked()).toBe(false)
  },
}

export const Indeterminate: Story = {
  args: {
    ngContent: 'Indeterminate.',
    indeterminate: true,
  },
  play: async ({ canvasElement, fixture }) => {
    const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
    await expectFn(await checkboxHarness.isIndeterminate()).toBe(true)
  },
}

export const Disabled: Story = {
  args: {
    ngContent: 'Disabled.',
    disabled: true,
  },
  play: async ({ canvasElement, fixture }) => {
    const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
    await expectFn(await checkboxHarness.isDisabled()).toBe(true)
    await expectFn(await checkboxHarness.isChecked()).toBe(false)
    await checkboxHarness.click()
    await expectFn(await checkboxHarness.isChecked()).toBe(false)
  },
}

export const ExampleToggling: Story = {
  args: {
    ngContent: 'Toggle example.',
  },
  play: async ({ canvasElement, fixture }) => {
    const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
    await expectFn(await checkboxHarness.isChecked()).toBe(false)
    await checkboxHarness.click()
    await expectFn(await checkboxHarness.isChecked()).toBe(true)
    await checkboxHarness.click()
    await expectFn(await checkboxHarness.isChecked()).toBe(false)
  },
}

export const ExampleIndeterminateToggle: Story = {
  args: {
    ngContent: 'Indeterminate toggle example.',
    indeterminate: true,
  },
  play: async ({ canvasElement, fixture }) => {
    const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
    await expectFn(await checkboxHarness.isChecked()).toBe(false)
    await expectFn(await checkboxHarness.isIndeterminate()).toBe(true)
    await checkboxHarness.click()
    await expectFn(await checkboxHarness.isChecked()).toBe(true)
    await expectFn(await checkboxHarness.isIndeterminate()).toBe(false)
    await checkboxHarness.click()
    await expectFn(await checkboxHarness.isChecked()).toBe(false)
    await expectFn(await checkboxHarness.isIndeterminate()).toBe(false)
  },
}

export const ExampleFormControl: Story = {
  render: args => ({
    props: {
      ...args,
      control: new FormControl(),
    },
    template: `<seam-checkbox ${argsToTpl()} [formControl]="control">{{ngContent}}</seam-checkbox>[ {{ control.value }} ]`
  }),
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
      ],
    }),
  ],
  args: {
    ngContent: 'FormControl.',
  },
  // play: async ({ canvasElement, fixture }) => {
  //   const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
  //   await expectFn(await checkboxHarness.isChecked()).toBe(false)
  //   await expectFn(await checkboxHarness.isIndeterminate()).toBe(true)
  //   await checkboxHarness.click()
  //   await expectFn(await checkboxHarness.isChecked()).toBe(true)
  //   await expectFn(await checkboxHarness.isIndeterminate()).toBe(false)
  //   await checkboxHarness.click()
  //   await expectFn(await checkboxHarness.isChecked()).toBe(false)
  //   await expectFn(await checkboxHarness.isIndeterminate()).toBe(false)
  // },
}
