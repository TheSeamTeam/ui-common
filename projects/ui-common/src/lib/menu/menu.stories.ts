import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamButtonsModule } from '../buttons/buttons.module'

import { TheSeamMenuModule } from './menu.module'

storiesOf('Components/Menu', module)
  .addDecorator(withKnobs)

  .add('Menu', () => ({
    moduleMetadata: {
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamButtonsModule,
        TheSeamMenuModule
      ]
    },
    props: { },
    template: `
      <div class="p-5">
        <seam-menu #menu>
          <button seamMenuItem>Item 1</button>
          <button seamMenuItem>Item 2</button>
          <button seamMenuItem>Item 3</button>
        </seam-menu>
      </div>
    `
  }))

  .add('Toggle', () => ({
    moduleMetadata: {
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamButtonsModule,
        TheSeamMenuModule
      ]
    },
    props: { },
    template: `
      <div class="p-5">
        <seam-menu #menu>
          <button seamMenuItem>Item 1</button>
          <button seamMenuItem>Item 2</button>
          <button seamMenuItem>Item 3</button>
        </seam-menu>
        <button [seamMenuToggle]="menu" seamButton theme="primary" style="margin-left: 200px;">Toggle</button>
      </div>
    `
  }))

  .add('MultiLevel', () => ({
    moduleMetadata: {
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamButtonsModule,
        TheSeamMenuModule
      ]
    },
    props: { },
    template: `
      <div class="p-5">
        <div class="alert alert-danger" role="alert">Not Implemented</div>
        <seam-menu #menu>
          <button seamMenuItem>Item 1</button>
          <button seamMenuItem>Item 2</button>
          <button seamMenuItem>Item 3</button>
        </seam-menu>
        <button [seamMenuToggle]="menu" seamButton theme="primary">Toggle</button>
      </div>
    `
  }))
