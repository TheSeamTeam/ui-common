import { moduleMetadata, applicationConfig, Meta, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { getHarness } from '@theseam/ui-common/testing'
import { argsToTpl } from '@theseam/ui-common/story-helpers'

import { TheSeamTelInputComponent } from './tel-input/tel-input.component'
import { TheSeamTelInputHarness } from './testing/tel-input.harness'

const meta: Meta<TheSeamTelInputComponent> = {
  title: 'TelInput/Components',
  component: TheSeamTelInputComponent,
  tags: [ 'autodocs' ],
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamTelInputComponent,
        ReactiveFormsModule,
        TheSeamFormFieldModule,
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<TheSeamTelInputComponent>

export const Basic: Story = { }

export const InitialValue: Story = {
  args: {
    value: '+1 901-555-5555',
  },
  play: async ({ canvasElement, fixture, args }) => {
    const telInputHarness = await getHarness(TheSeamTelInputHarness, { canvasElement, fixture })
    await expect(await telInputHarness.isRequired()).toBe(false)
    await expect(await telInputHarness.getValue()).toBe('+1 901-555-5555')
    await telInputHarness.setValue('+19015555556')
    expect(await telInputHarness.getValue()).toBe('+1 901-555-5556')
    // expect(args.change).toBeCalledTimes(1)
  },
}

export const InitialValueControl: Story = {
  render: args => ({
    template: `<seam-tel-input ${argsToTpl()} [formControl]="control"></seam-tel-input>`,
    props: {
      ...args,
      control: new FormControl('+1 901-555-5555', [], []),
    },
  }),
  play: async ({ canvasElement, fixture, args }) => {
    const telInputHarness = await getHarness(TheSeamTelInputHarness, { canvasElement, fixture })
    await expect(await telInputHarness.isRequired()).toBe(false)
    expect(await telInputHarness.getValue()).toBe('+1 901-555-5555')
    // expect(args.change).toBeCalledTimes(1)
  },
}

// export const ValueChange: Story = {
//   play: async ({ canvasElement, fixture, args }) => {
//     const telInputHarness = await getHarness(TheSeamTelInputHarness, { canvasElement, fixture })
//     await expect(await telInputHarness.isRequired()).toBe(false)
//     // await expect(await telInputHarness.getValue()).toBe('+1 901-555-5555')
//     await expect(await telInputHarness.getValue()).toBe('')
//     await telInputHarness.setValue('+19015555556')
//     expect(await telInputHarness.getValue()).toBe('+1 901-555-5556')
//     expect(args.change).toBeCalledTimes(1)
//   },
// }

// export const ValueChangeControl: Story = {
//   render: args => ({
//     template: `<seam-tel-input ${argsToTpl()} [formControl]="control"></seam-tel-input>`,
//     props: {
//       ...args,
//       control: new FormControl('+1 901-555-5555', [], []),
//     },
//   }),
//   play: async ({ canvasElement, fixture, args }) => {
//     const telInputHarness = await getHarness(TheSeamTelInputHarness, { canvasElement, fixture })
//     await expect(await telInputHarness.isRequired()).toBe(false)
//     // await expect(await telInputHarness.getValue()).toBe('+1 901-555-5555')
//     await telInputHarness.setValue('+19015555556')
//     // expect(await telInputHarness.getValue()).toBe('+1 901-555-5556')
//     console.dir(args.change)
//     expect(args.change).toBeCalledTimes(1)
//   },
// }

export const Control: Story = {
  render: args => ({
    template: `<seam-tel-input seamInput></seam-tel-input>`,
  }),
}

export const FormField: Story = {
  render: args => {
    // const control = new FormControl('+17024181234', [], [])
    // const control = new FormControl('9015555555', [], [])
    const control = new FormControl('+213 901-555-5555', [], [])

    // control.valueChanges.subscribe(v => console.log('%c[Story] value', 'color:red', v))

    return {
      props: {
        control,
      },
      template: `
        <div style="max-width: 300px;">
          <seam-form-field>
            <seam-tel-input seamInput [formControl]="control"></seam-tel-input>
          </seam-form-field>
        </div>
      `,
    }
  },
}

export const FormFieldDisabled: Story = {
  render: args => {
    // const control = new FormControl('+17024181234', [], [])
    // const control = new FormControl('9015555555', [], [])
    const control = new FormControl('+213 901-555-5555', [], [])
    control.disable()

    // control.valueChanges.subscribe(v => console.log('%c[Story] value', 'color:red', v))

    return {
      props: {
        control,
      },
      template: `
        <div style="max-width: 300px;">
          <seam-form-field>
            <seam-tel-input seamInput [formControl]="control"></seam-tel-input>
          </seam-form-field>
        </div>
      `,
    }
  },
}

// export const Validator: Story = (args) => {
//   // const control = new FormControl('+17024181234', [], [ telInputValidator ])
//   const control = new FormControl('9015555555', [ ], [ telInputValidator ])
//   // const control = new FormControl('90155555', [ Validators.required ], [ telInputValidator ])
//   // const control = new FormControl('+213 901-555-5555', [], [ telInputValidator ])
//   // const control = new FormControl('19015555555', [], [ telInputValidator ])
//   // const control = new FormControl('', [], [ telInputValidator ])

//   // control.valueChanges.subscribe(v => console.log('%c[Story] value', 'color:red', v))

//   return {
//     props: {
//       control,
//       disabled: args.disabled
//     },
//     template: `
//       <div style="max-width: 300px;">
//         <seam-form-field>
//           <seam-tel-input seamInput [formControl]="control"
//             [seamDisableControl]="disabled">
//           </seam-tel-input>
//           <ng-template seamFormFieldError="telInput">Invalid number.</ng-template>
//         </seam-form-field>
//       </div>
//     `
//   }
// }

// export const Form: Story = (args) => {
//   const control = new FormControl('9015555555', [ ], [ telInputValidator ])

//   control.valueChanges.subscribe(v => console.log('%c[Story] value', 'color:red', v))

//   const group = new FormGroup({
//     phoneNumber: control
//   })

//   return {
//     props: {
//       control,
//       group,
//       disabled: args.disabled
//     },
//     template: `
//       <div style="max-width: 300px;">
//         <form [formGroup]="group">
//           <seam-form-field>
//             <seam-tel-input seamInput formControlName="phoneNumber"
//               [seamDisableControl]="disabled">
//             </seam-tel-input>
//             <ng-template seamFormFieldError="telInput">Invalid number.</ng-template>
//           </seam-form-field>
//         </form>
//       </div>
//     `
//   }
// }
