import { select, text, withKnobs } from '@storybook/addon-knobs'
import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { _knobUndefinedNullHACK } from '../utils/storybook-knobs-hack'

import { TheSeamCheckboxComponent } from './checkbox.component'
import { TheSeamCheckboxModule } from './checkbox.module'

export default {
  title: 'Components/Checkbox',
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamCheckboxModule
      ]
    })
  ]
}

export const InitiallyChecked = () => ({
  component: TheSeamCheckboxComponent,
  props: {
    labelText: 'Initially checked.'
  },
  // template: `<seam-checkbox [checked]="true">{{ labelText }}</seam-checkbox>`
})

InitiallyChecked.story = {
  name: 'Checked'
}
