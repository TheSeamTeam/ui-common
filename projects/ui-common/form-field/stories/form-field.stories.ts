import { moduleMetadata } from '@storybook/angular'

import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { NgSelectModule } from '@ng-select/ng-select'
import dedent from 'ts-dedent'

import { TheSeamFormFieldComponent } from '../form-field.component'
import { TheSeamFormFieldModule } from '../form-field.module'

export default {
  title: 'Form Field/Components',
  component: TheSeamFormFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamFormFieldModule,
        ReactiveFormsModule
      ]
    }),
    // withKnobs
  ],
  parameters: {
    docs: {
      iframeHeight: '300px',
    }
  }
}

export const Simple = () => ({
  props: {
    control: new FormControl('')
  },
  template: `
    <div class="p-1" style="min-height: 100px; width: 500px;">
      <seam-form-field label="Example">
        <input seamInput [formControl]="control">
      </seam-form-field>
    </div>
  `
})

export const LabelTemplate = () => ({
  props: {
    control: new FormControl('')
  },
  template: `
    <div class="p-1" style="min-height: 100px; width: 500px;">
      <seam-form-field>
        <strong *seamFormFieldLabelTpl>Tax ID:</strong>
        <input seamInput [formControl]="control">
      </seam-form-field>
    </div>
  `
})

LabelTemplate.story = {
  name: 'Label Template'
}

export const ValidatorTemplate = () => ({
  props: {
    control: new FormControl('', [ Validators.required ])
  },
  template: `
    <div class="p-1" style="min-height: 100px; width: 500px;">
      <span class="p-1 border bg-light">
        <em>Focus input then unfocus without a value.</em>
      </span>
      <seam-form-field label="Example">
        <input seamInput [formControl]="control">
        <ng-template seamFormFieldError="required">Valid is required.</ng-template>
      </seam-form-field>
    </div>
  `
})

ValidatorTemplate.story = {
  name: 'Validator Message'
}

export const ValidatorPaddingMessages = () => ({
  props: {
    control: new FormControl('', [ Validators.required ]),
    control2: new FormControl('', [ Validators.required ]),
    control3: new FormControl('', [ Validators.required, Validators.email, Validators.minLength(6) ]),
    // n: number('numPaddingErrors', 3)
  },
  template: `
    <div class="p-1" style="min-height: 100px; width: 500px;">
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
    </div>
  `
})

ValidatorPaddingMessages.story = {
  name: 'Validator Padding Messages',
  parameters: {
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
  }
}

export const NgSelect = () => ({
  moduleMetadata: {
    imports: [
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
    <div class="p-1" style="min-height: 100px; width: 500px;">
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
})

export const RequiredIndicator = () => ({
  props: {
    control: new FormControl('')
  },
  template: `
    <div class="p-1" style="min-height: 100px; width: 500px;">
      <seam-form-field label="Example">
        <input seamInput [formControl]="control" required>
      </seam-form-field>
    </div>
  `
})

RequiredIndicator.story = {
  name: 'Required Indicator',
  notes: {
    markdown: dedent(`
    # Required Indicator

    To make an input show a required indicator, add the \`required\` attribute
    or the \`required\` input on the \`seamInput\` directive. The form control
    alone can't be used, because there is not a required property and validators
    are not a reliable way to tell if a control is required. We have a way to
    check based on validators, but I am not sure if it is a good idea to use it
    yet for various reasons discussed in
    \`projects/ui-common/src/lib/utils/form/has-required-control.ts\`.
    `)
  }
}

export const RequiredIndicatorLabelTemplate = () => ({
  props: {
    control: new FormControl('')
  },
  template: `
    <div class="p-1" style="min-height: 100px; width: 500px;">
      <seam-form-field>
        <ng-template seamFormFieldLabelTpl>
          Name<seam-form-field-required-indicator class="pl-1"></seam-form-field-required-indicator>
        </ng-template>
        <input seamInput [formControl]="control" required>
      </seam-form-field>
    </div>
  `
})

export const RequiredIndicatorLabelTemplateCustom = () => ({
  props: {
    control: new FormControl('')
  },
  template: `
    <div class="p-1" style="min-height: 100px; width: 500px;">
      <seam-form-field>
        <ng-template seamFormFieldLabelTpl let-required="required">
          Name<span *ngIf="required" class="text-danger pl-1">~*~</span>
        </ng-template>
        <input seamInput [formControl]="control" required>
      </seam-form-field>
    </div>
  `
})

export const Password = () => ({
  props: {
    control: new FormControl('')
  },
  template: `
    <div class="p-1" style="min-height: 100px; width: 500px;">
      <seam-form-field>
        <input seamInput [formControl]="control" type="password">
      </seam-form-field>
    </div>
  `
})

export const HelpText = () => ({
  props: {
    control: new FormControl('')
  },
  template: `
    <div class="p-1" style="min-height: 100px; width: 500px;">
      <seam-form-field helpText="Anim elit fugiat consectetur qui ullamco nulla sunt veniam reprehenderit dolor non sint adipisicing laborum.">
        <input seamInput [formControl]="control" required>
        <ng-template seamFormFieldError="required">Valid is required.</ng-template>
      </seam-form-field>
    </div>
  `
})

export const HelpTemplate = () => ({
  props: {
    control: new FormControl('')
  },
  template: `
    <div class="p-1" style="min-height: 100px; width: 500px;">
      <seam-form-field>
        <input seamInput [formControl]="control" required>
        <ng-template seamFormFieldHelpText>
          Et esse fugiat officia nostrud eu non excepteur ullamco magna esse aliqua fugiat fugiat.
        </ng-template>
        <ng-template seamFormFieldError="required">Valid is required.</ng-template>
      </seam-form-field>
    </div>
  `
})