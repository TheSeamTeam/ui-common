import { Meta, StoryObj, applicationConfig, componentWrapperDecorator, moduleMetadata } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamNgSelectHarness, getHarness } from '@theseam/ui-common/testing'
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select'
import { argsToTpl } from '@theseam/ui-common/story-helpers'

const meta: Meta<NgSelectComponent> = {
  title: 'External/ngSelect',
  tags: [ 'autodocs' ],
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        NgSelectModule,
        ReactiveFormsModule,
      ],
    }),
    // componentWrapperDecorator(NgSelectComponent, ({ args }) => args),
  ],
  render: args => ({
    props: args,
    template: `<ng-select ${argsToTpl()}></ng-select>`,
  }),
  argTypes: {
    // onSubmit: { action: 'onSubmit' }
  },
  args: {
    // framework: 'seam-framework',
  },
}

export default meta
type Story = StoryObj<NgSelectComponent>

export const Basic: Story = {
  args: {
    items: [
      'one',
      'two',
      'three',
      'four',
    ],
  },
  play: async ({ canvasElement, fixture, args }) => {
    const ngSelectHarness = await getHarness(TheSeamNgSelectHarness, { canvasElement, fixture })
    await expect(await ngSelectHarness.isRequired()).toBe(false)
    await expect(await ngSelectHarness.getValue()).toBe(null)
    await ngSelectHarness.clickOption({ value: 'two' })
    await expect(await ngSelectHarness.getValue()).toBe('two')
    // const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
    // await sfFormHarness.submit()
    // await expect(args.onSubmit).toHaveBeenCalledWith({ Colors: true })
  },
}

// export const SplitButton: Story = {
//   args: {
//     schema: {
//       'type': 'object',
//       '$schema': 'http://json-schema.org/draft-07/schema#',
//       'properties': {
//         'Colors': {
//           'type': 'string',
//           'enum': [ 'red', 'green', 'blue' ],
//           'enumNames': [ 'Red', 'Green', 'Blue' ],
//         },
//         'ExportType': {
//           'type': 'string',
//           'enum': [ 'pdf', 'xlsx' ],
//           'enumNames': [ 'PDF', 'XLSX' ],
//           'default': 'xlsx',
//         },
//       },
//       'required': [
//         'Colors',
//         'ExportType',
//       ],
//     },
//     layout: [
//       { 'dataPointer': '/Colors' },
//       {
//         'type': 'submit', 'title': 'Generate',
//         'items': [
//           { 'dataPointer': '/ExportType' },
//         ],
//       },
//     ],
//   },
//   play: async ({ canvasElement, fixture, args }) => {
//     const sfSubmitHarness = await getHarness(TheSeamSchemaFormSubmitSplitHarness, { canvasElement, fixture })
//     await expect(await sfSubmitHarness.isRequired()).toBe(true)
//     await sfSubmitHarness.click()
//     const sfFormHarness = await getHarness(JsonSchemaFormHarness, { canvasElement, fixture })
//     await sfFormHarness.submit()
//     await expect(args.onSubmit).toHaveBeenCalledWith({ Colors: true })
//   },
// }
