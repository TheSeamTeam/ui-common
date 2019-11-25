import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { ThemeNames } from '../../models/index'

import { ToggleButtonComponent } from './toggle-button.component'

storiesOf('Components/Buttons/ToggleButton', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        ToggleButtonComponent
      ],
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        ReactiveFormsModule
      ]
    },
    props: {
      btnText: text('Button Text', 'Toggle Button'),
      theme: select('Theme', ThemeNames, 'primary'),
      size: select('Size', { 'undefined': '', sm: 'btn-sm', lg: 'btn-lg' }, ''),
      control: new FormControl(false)
    },
    template: `
      <div class="p-5">
        <button class="btn btn-outline-{{ theme }} {{ size }}"
          seamToggleButton
          [formControl]="control">
          {{ btnText }}
        </button>

        <div class="bg-light border p-2 mt-4">Value: {{ control.value }}</div>
      </div>
    `
  }))
