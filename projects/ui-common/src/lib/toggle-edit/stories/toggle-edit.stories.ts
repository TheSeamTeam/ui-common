import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamFormFieldModule } from '../../form-field/form-field.module'
import { TheSeamToggleEditModule } from '../toggle-edit.module'

storiesOf('Components|Toggle Edit', module)

  .add('Simple', () => ({
    moduleMetadata: {
      imports: [
        TheSeamToggleEditModule,
        TheSeamFormFieldModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ]
    },
    props: {
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
  }))

  .add('Label Template', () => ({
    moduleMetadata: {
      imports: [
        TheSeamToggleEditModule,
        TheSeamFormFieldModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ]
    },
    props: {
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
  }))

  .add('Validator Message', () => ({
    moduleMetadata: {
      imports: [
        TheSeamToggleEditModule,
        TheSeamFormFieldModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ]
    },
    props: {
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
  }))
