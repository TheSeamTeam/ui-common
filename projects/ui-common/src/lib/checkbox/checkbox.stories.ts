import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { _knobUndefinedNullHACK } from '../utils/storybook-knobs-hack'

import { TheSeamCheckboxComponent } from './checkbox.component'

storiesOf('Components|Checkbox', module)
  .addDecorator(withKnobs)
  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        TheSeamCheckboxComponent
      ],
      imports: [
        BrowserAnimationsModule,
        BrowserModule
      ]
    },
    props: {
      labelText: 'Allow this member to upload bales and receive protocol credits on my behalf.'
    },
    template: `
      <div class="p-5">
        <seam-checkbox seamInput>{{ labelText }}</seam-checkbox>
      </div>
    `
  }))
