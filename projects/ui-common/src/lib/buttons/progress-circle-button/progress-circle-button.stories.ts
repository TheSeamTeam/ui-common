import { boolean, number, select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { ThemeNames } from '../../models/index'
import { TheSeamProgressModule } from '../../progress/index'

import { _knobUndefinedNullHACK } from '../../utils/storybook-knobs-hack'
import { ProgressCircleButtonComponent } from './progress-circle-button.component'

storiesOf('Components|Buttons/ProgressCircleButton', module)
  .addDecorator(withKnobs)
  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        ProgressCircleButtonComponent
      ],
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamProgressModule
      ]
    },
    props: {
      btnText: text('Button Text', 'Percentage Button'),
      percentage: number('Percentage', 60, {
        range: true,
        min: 0,
        max: 100,
        step: 1,
      }),
      fillBackground: boolean('Fill Background', false),
      showText: boolean('Show Text', false),
      hiddenOnEmpty: boolean('Hidden On Empty', true),
      theme: select('Theme', ThemeNames, 'primary'),
      size: select('Size', { 'undefined': '__undefined__', sm: 'sm', lg: 'lg' }, 'undefined'),
      //
      _knobHack: _knobUndefinedNullHACK
    },
    template: `
      <div class="p-5">
        <button
          seamProgressCircleButton
          theme="outline-{{ theme }}"
          [size]="_knobHack(size)"
          [fillBackground]="fillBackground"
          [showText]="showText"
          [hiddenOnEmpty]="hiddenOnEmpty"
          [percentage]="percentage">
          {{ btnText }}
        </button>
      </div>
    `
  }))
