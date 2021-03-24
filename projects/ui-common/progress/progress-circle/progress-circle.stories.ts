import { action } from '@storybook/addon-actions'
import { boolean, number, select, text, withKnobs } from '@storybook/addon-knobs'
import { moduleMetadata } from '@storybook/angular'

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
    withKnobs
  ],
  parameters: {
    docs: {
      iframeHeight: '300px',
    }
  }
}

export const Basic = () => ({
  props: {
    fillBackground: boolean('fillBackground', false),
    showText: boolean('showText', false),
    hiddenOnEmpty: boolean('hiddenOnEmpty', false),
    percentage: number('percentage', 35),
    pending: boolean('pending', false)
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
