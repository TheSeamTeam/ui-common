import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamCheckboxComponent } from './checkbox.component'
import { TheSeamCheckboxModule } from './checkbox.module'

export default {
  title: 'Components/Checkbox',
  component: TheSeamCheckboxComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamCheckboxModule
      ]
    })
  ],
  parameters: {
    docs: {
      iframeHeight: '40px',
    }
  }
}

export const Checkbox = () => ({
  template: `<seam-checkbox>Checkbox</seam-checkbox>`
})

Checkbox.story = {
  name: 'Checkbox'
}

export const InitiallyChecked = () => ({
  template: `<seam-checkbox [checked]="true">Initially checked.</seam-checkbox>`
})

InitiallyChecked.story = {
  name: 'Checked'
}

export const InitiallyUnchecked = () => ({
  template: `<seam-checkbox [checked]="false">Initially unchecked.</seam-checkbox>`
})

InitiallyUnchecked.story = {
  name: 'Unchecked'
}

export const InitiallyIndeterminate = () => ({
  template: `<seam-checkbox [indeterminate]="true">Initially indeterminate.</seam-checkbox>`
})

InitiallyIndeterminate.story = {
  name: 'Indeterminate'
}
