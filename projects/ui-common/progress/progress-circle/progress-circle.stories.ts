// import { action } from '@storybook/addon-actions'
// import { boolean, number, select, text, withKnobs } from '@storybook/addon-knobs'
import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamProgressModule } from '../progress.module'
import { ProgressCircleComponent } from './progress-circle.component'

export default {
  title: 'Components/Progress/ProgressCircle',
  component: ProgressCircleComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamProgressModule
      ]
    }),
  ],
  parameters: {
    docs: {
      iframeHeight: '300px',
    }
  }
} as Meta

export const Basic: Story = (args) => ({
  props: {
    ...args
  },
  template: `
    <seam-progress-circle style="position: relative; width: 100px; height: 100px"
      [fillBackground]="fillBackground"
      [showText]="showText"
      [hiddenOnEmpty]="hiddenOnEmpty"
      [percentage]="percentage"
      [pending]="pending">
    </seam-progress-circle>`
})
Basic.args = {
  hiddenOnEmpty: false,
  percentage: 35
}
Basic.argTypes = {
  percentage: {
    control: { type: 'range', min: 0, max: 100, step: 1 },
  },
}
