import { moduleMetadata } from '@storybook/angular'
import type { Meta, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'
import { TheSeamTelInputModule } from './tel-input.module'
import { TheSeamTelInputComponent } from './tel-input/tel-input.component'

export default {
  title: 'TelInput/Components',
  component: TheSeamTelInputComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamTelInputModule,
        ReactiveFormsModule,
        TheSeamFormFieldModule,
        TheSeamSharedModule,
      ],
    }),
  ],
} as Meta

export const Basic: Story = ({ ...args }) => ({
  // template: `<seam-tel-input></seam-tel-input>`
  component: TheSeamTelInputComponent,
  props: args,
})

export const Control: Story = ({ ...args }) => ({
  template: `<seam-tel-input seamInput></seam-tel-input>`
})

export const FormField: Story = ({ ...args }) => {
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
}

export const FormFieldDisabled: Story = ({ ...args }) => {
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
