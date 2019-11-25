import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { ThemeNames } from '../../models/index'
import { _knobUndefinedNullHACK } from '../../utils/storybook-knobs-hack'

import { ButtonComponent } from './button.component'

storiesOf('Components/Buttons/Button', module)
  .addDecorator(withKnobs)
  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        ButtonComponent
      ],
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
      ]
    },
    props: {
      btnText: text('Button Text', 'I Am Button'),
      theme: select('Theme', ThemeNames, 'primary'),
      size: select('Size', { 'undefined': '__undefined__', sm: 'sm', lg: 'lg' }, 'undefined'),
      type: select('Type', { 'undefined': '__undefined__', 'button': 'button', 'submit': 'submit' }, 'button'),
      //
      _knobHack: _knobUndefinedNullHACK
    },
    template: `
      <div class="p-5">
        <button
          seamButton
          [theme]="theme"
          [size]="_knobHack(size)"
          [type]="_knobHack(type)">
          {{ btnText }}
        </button>
      </div>
    `
  }))
