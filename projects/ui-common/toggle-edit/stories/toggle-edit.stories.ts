import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'

import { ToggleEditComponent } from '../toggle-edit.component'
import { TheSeamToggleEditModule } from '../toggle-edit.module'

export default {
  title: 'Toggle Edit/Components',
  component: ToggleEditComponent ,
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamToggleEditModule,
        TheSeamFormFieldModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ]
    })
  ]
} as Meta

export const Simple: Story = (args) => ({
  props: {
    ...args,
    control: new FormControl('abc')
  },
  template: `
    <div class="p-4" style="height: 400px; width: 500px;">
      <seam-form-field label="Example">
        <seam-toggle-edit>
          <input seamInput [formControl]="control">
        </seam-toggle-edit>
      </seam-form-field>
    </div>`
})

export const LabelTemplate: Story = (args) => ({
  props: {
    ...args,
    control: new FormControl('abc')
  },
  template: `
    <div class="p-4" style="height: 400px; width: 500px;">
      <seam-form-field>
        <strong *seamFormFieldLabelTpl>Tax ID:</strong>
        <seam-toggle-edit>
          <input seamInput [formControl]="control">
        </seam-toggle-edit>
      </seam-form-field>
    </div>`
})

export const ValidatorMessage: Story = (args) => ({
  props: {
    ...args,
    control: new FormControl('abc', [ Validators.maxLength(3) ])
  },
  template: `
    <div class="p-4" style="height: 400px; width: 500px;">
      <span class="p-1 border bg-light">
        <em>Type more than 3 characters.</em>
      </span>
      <seam-form-field label="Example">
        <seam-toggle-edit>
          <input seamInput [formControl]="control">
        </seam-toggle-edit>
        <ng-template seamFormFieldError="maxlength">Input must be less than 3 characters.</ng-template>
      </seam-form-field>
    </div>`
})
