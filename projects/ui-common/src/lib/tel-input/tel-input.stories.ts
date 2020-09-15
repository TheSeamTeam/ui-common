import { moduleMetadata } from '@storybook/angular'
import type { Meta, Story } from '@storybook/angular/types-6-0'

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { merge } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

import { TheSeamFormFieldModule } from '../form-field/form-field.module'
import { TheSeamSharedModule } from './../shared/shared.module'
import { telInputValidator } from './tel-input-validator'
import { TheSeamTelInputModule } from './tel-input.module'
import { TheSeamTelInputComponent } from './tel-input/tel-input.component'

export default {
  title: 'Components/TelInput',
  component: TheSeamTelInputComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamTelInputModule,
        ReactiveFormsModule,
        TheSeamFormFieldModule,
        TheSeamSharedModule
      ]
    })
  ],
} as Meta

export const Basic: Story = ({ ...args }) => ({
  // template: `<seam-tel-input></seam-tel-input>`
  component: TheSeamTelInputComponent,
  props: args
})

export const Control: Story = ({ ...args }) => ({
  template: `<seam-tel-input seamInput></seam-tel-input>`
})

export const FormField: Story = ({ ...args }) => {
  // const control = new FormControl('+17024181234', [], [])
  // const control = new FormControl('9016067687', [], [])
  const control = new FormControl('+213 901-606-7687', [], [])

  // control.valueChanges.subscribe(v => console.log('%c[Story] value', 'color:red', v))

  return {
    props: {
      control
    },
    template: `
      <div style="max-width: 300px;">
        <seam-form-field>
          <seam-tel-input seamInput [formControl]="control"></seam-tel-input>
        </seam-form-field>
      </div>
    `
  }
}

export const Validator: Story = (args) => {
  // const control = new FormControl('+17024181234', [], [ telInputValidator ])
  const control = new FormControl('9016067687', [ ], [ telInputValidator ])
  // const control = new FormControl('90160676', [ Validators.required ], [ telInputValidator ])
  // const control = new FormControl('+213 901-606-7687', [], [ telInputValidator ])
  // const control = new FormControl('19016067687', [], [ telInputValidator ])
  // const control = new FormControl('', [], [ telInputValidator ])

  // control.valueChanges.subscribe(v => console.log('%c[Story] value', 'color:red', v))

  return {
    props: {
      control,
      disabled: args.disabled
    },
    template: `
      <div style="max-width: 300px;">
        <seam-form-field>
          <seam-tel-input seamInput [formControl]="control"
            [seamDisableControl]="disabled">
          </seam-tel-input>
          <ng-template seamFormFieldError="telInput">Invalid number.</ng-template>
        </seam-form-field>
      </div>
    `
  }
}

export const Form: Story = (args) => {
  const control = new FormControl('9016067687', [ ], [ telInputValidator ])

  control.valueChanges.subscribe(v => console.log('%c[Story] value', 'color:red', v))

  const group = new FormGroup({
    phoneNumber: control
  })

  return {
    props: {
      control,
      group,
      disabled: args.disabled
    },
    template: `
      <div style="max-width: 300px;">
        <form [formGroup]="group">
          <seam-form-field>
            <seam-tel-input seamInput formControlName="phoneNumber"
              [seamDisableControl]="disabled">
            </seam-tel-input>
            <ng-template seamFormFieldError="telInput">Invalid number.</ng-template>
          </seam-form-field>
        </form>
      </div>
    `
  }
}
