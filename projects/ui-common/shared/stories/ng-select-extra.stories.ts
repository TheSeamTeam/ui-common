import { moduleMetadata } from '@storybook/angular'

import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { NgSelectModule } from '@ng-select/ng-select'

import { TheSeamScrollbarModule } from './../../scrollbar/scrollbar.module'
import { TheSeamSharedModule } from './../shared.module'

export default {
  title: 'Shared/NgSelectExtra',
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        NgSelectModule,
        TheSeamSharedModule,
        ReactiveFormsModule,
        TheSeamScrollbarModule
      ]
    })
  ]
}

export const Basic = () => ({
  props: {
    control: new FormControl(),
    items: [
      'one',
      'two',
      'three',
      'wd',
      'th1ree',
      'th2ree',
      'thr3ee',
      'th4ree',
      'thr5ee',
      'th6ree',
      'th7ree',
    ]
  },
  template: `
    <div style="height: 400px; box-sizing: border-box; border: 1px solid blue; overflow: scroll;"
      [seamOverlayScrollbar]="{ overflowBehavior: { x: 'hidden' } }">
      <div style="height: 1500px; padding-top: 150px;">
        <ng-select
          [formControl]="control"
          class="form-control"
          appendTo="body"
          [items]="items">
        </ng-select>
      </div>
    </div>`
})
