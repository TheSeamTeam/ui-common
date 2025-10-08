import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'

import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'

import { TheSeamToggleEditComponent } from '../toggle-edit.component'
import { TheSeamToggleEditModule } from '../toggle-edit.module'

interface ExtraArgs { }

type StoryComponentType = TheSeamToggleEditComponent & ExtraArgs

const meta: Meta<StoryComponentType> = {
  title: 'Toggle Edit/Components',
  component: TheSeamToggleEditComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        TheSeamToggleEditModule,
        TheSeamFormFieldModule,
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<StoryComponentType>

export const Simple: Story = {
  render: args => ({
    props: {
      ...args,
      control: new FormControl('abc'),
    },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
        <seam-form-field label="Example">
          <seam-toggle-edit>
            <input seamInput [formControl]="control">
          </seam-toggle-edit>
        </seam-form-field>
      </div>`,
  }),
}

export const LabelTemplate: Story = {
  render: args => ({
    props: {
      ...args,
      control: new FormControl('abc'),
    },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
        <seam-form-field>
          <strong *seamFormFieldLabelTpl>Tax ID:</strong>
          <seam-toggle-edit>
            <input seamInput [formControl]="control">
          </seam-toggle-edit>
        </seam-form-field>
      </div>`,
  }),
}

export const ValidatorMessage: Story = {
  render: args => ({
    props: {
      ...args,
      control: new FormControl('abc', [ Validators.maxLength(3) ]),
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
      </div>`,
  }),
}
