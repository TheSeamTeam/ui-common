import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamCheckboxComponent } from './checkbox.component'
import { TheSeamCheckboxModule } from './checkbox.module'

export default {
  title: 'Checkbox/Components',
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

export const Basic = ({ ...args }) => ({
  template: `<seam-checkbox>Checkbox</seam-checkbox>`
})

export const Checked = ({ ...args }) => ({
  template: `<seam-checkbox [checked]="true">Initially checked.</seam-checkbox>`
})

export const Unchecked = ({ ...args }) => ({
  template: `<seam-checkbox [checked]="false">Initially unchecked.</seam-checkbox>`
})

export const Indeterminate = ({ ...args }) => ({
  template: `<seam-checkbox [indeterminate]="true">Initially indeterminate.</seam-checkbox>`
})
