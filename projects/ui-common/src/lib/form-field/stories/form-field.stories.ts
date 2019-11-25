import { action } from '@storybook/addon-actions'
import { number, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { NgSelectModule } from '@ng-select/ng-select'
import dedent from 'ts-dedent'

import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamFormFieldModule } from '../form-field.module'

storiesOf('Components/Form Field', module)
  .addDecorator(withKnobs)

  .add('Simple', () => ({
    moduleMetadata: {
      imports: [
        TheSeamFormFieldModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ]
    },
    props: {
      control: new FormControl('')
    },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
        <seam-form-field label="Example">
          <input seamInput [formControl]="control">
        </seam-form-field>
      </div>`
  }))

  .add('Label Template', () => ({
    moduleMetadata: {
      imports: [
        TheSeamFormFieldModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ]
    },
    props: {
      control: new FormControl('')
    },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
        <seam-form-field>
          <strong *seamFormFieldLabelTpl>Tax ID:</strong>
          <input seamInput [formControl]="control">
        </seam-form-field>
      </div>`
  }))

  .add('Validator Message', () => ({
    moduleMetadata: {
      imports: [
        TheSeamFormFieldModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ]
    },
    props: {
      control: new FormControl('', [ Validators.required ])
    },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
        <span class="p-1 border bg-light">
          <em>Focus input then unfocus without a value.</em>
        </span>
        <seam-form-field label="Example">
          <input seamInput [formControl]="control">
          <ng-template seamFormFieldError="required">Valid is required.</ng-template>
        </seam-form-field>
      </div>`
  }))

  .add('Validator Padding Messages', () => ({
    moduleMetadata: {
      imports: [
        TheSeamFormFieldModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ]
    },
    props: {
      control: new FormControl('', [ Validators.required ]),
      control2: new FormControl('', [ Validators.required ]),
      control3: new FormControl('', [ Validators.required, Validators.email, Validators.minLength(6) ]),
      n: number('numPaddingErrors', 3)
    },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
        <seam-form-field label="Example">
          <input seamInput [formControl]="control">
          <ng-template seamFormFieldError="required">Valid is required.</ng-template>
        </seam-form-field>

        <seam-form-field label="Example2" [numPaddingErrors]="n">
          <input seamInput [formControl]="control2">
          <ng-template seamFormFieldError="required">Valid is required.</ng-template>
        </seam-form-field>

        <div class="p-1 border bg-light">
          <em>Using the <strong>external</strong> input of decorator <strong>seamFormFieldError</strong>
          you can tell the field to ignore displaying a message for the validator, because it is being
          handled externally.</em>
        </div>
        <seam-form-field label="Example3">
          <input seamInput [formControl]="control3">
          <ng-template seamFormFieldError="required">Valid is required.</ng-template>
          <ng-template seamFormFieldError="email minlength" [external]="true">Email and minLength is required.</ng-template>
        </seam-form-field>

        <div>Example content</div>
      </div>`
  }), {
    notes: {
      markdown: dedent(`
        # Validator Padding Messages

        > _numPaddingErrors_ default: 1

        The \`numPaddingErrors\` input will make sure at least \`n\` error lines
        worth of spacing are always visible.

        So, assuming you have 3 validators that will take up one line each. If
        you set \`numPaddingErrors\` to 3 the available space for 3 errors will
        always be visible.

        > *NOTE:* Implementation will change to allow each validator to specify
        it's own expected number of lines or just a specific height, but for now
        each validator is expected to only take one line to benefit from this.
        Currently if you set \`numPaddingErrors\` to 3 and you have one validator
        that renders 2 lines of text, there will still be one extra empty line
        below it.
      `)
    }
  })

  .add('NgSelect', () => ({
    moduleMetadata: {
      imports: [
        TheSeamFormFieldModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        NgSelectModule
      ]
    },
    props: {
      control: new FormControl('', [ Validators.required ]),
      items: [
        { id: 1, name: 'one' },
        { id: 2, name: 'two' },
        { id: 3, name: 'three' }
      ]
    },
    template: `
      <div class="p-4" style="height: 400px; width: 500px;">
        <span class="p-1 border bg-light">
          <em>Focus input then unfocus without a value.</em>
        </span>
        <seam-form-field label="Example">
          <ng-select
            seamInput
            [formControl]="control"
            [items]="items"
            bindLabel="id"
            bindValue="name"
            placeholder="Select an item"
            [clearable]="false"
            required>
          </ng-select>
          <ng-template seamFormFieldError="required">Valid is required.</ng-template>
        </seam-form-field>
      </div>`
  }))

