import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { Component, Input } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { ThemeNames, ThemeTypes } from '../../models/index'

import { TheSeamConfirmDialogModule } from '../confirm-dialog.module'
import { SeamConfirmDialogService } from '../confirm-dialog.service'

storiesOf('Components|ConfirmDialog/Directive', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      imports: [
        TheSeamConfirmDialogModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      msgText: text('Message', 'Do you confirm?'),
      confirmed() {
        console.log('Confirmed')
      }
    },
    template: `
      <div class="p-4">
        <button type="button"
          class="btn btn-lightgray"
          [libConfirmMsg]="msgText"
          (seamConfirmClick)="confirmed()">
          Open Dialog
        </button>
      </div>
      `
  }))

  .add('With Alert', () => ({
    moduleMetadata: {
      imports: [
        TheSeamConfirmDialogModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      msgText: text('Message', 'Do you confirm?'),
      alertMsgText: text('Alert Message', 'This is an alert'),
      theme: select('Theme', ThemeNames, 'warning'),
      confirmed() {
        console.log('Confirmed')
      }
    },
    template: `
      <div class="p-4">
        <button type="button"
          class="btn m-2"
          [libConfirmMsg]="msgText"
          [libConfirmAlert]="{ message: alertMsgText, type: theme }"
          (seamConfirmClick)="confirmed()">
          Open Dialog
        </button>
      </div>
      `
  }))






@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-seam-confirm-dialog-basic-service',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button"
        class="btn btn-lightgray"
        (click)="open()">
        Open Dialog
      </button>
    </div>`
})
export class StoryLibConfirmDialogBasicServiceComponent {

  @Input() msgText: string

  constructor(
    private _confirmDialog: SeamConfirmDialogService
  ) { }

  open() {
    this._confirmDialog.open(this.msgText).afterClosed().subscribe(result => {
      if (result === 'confirm') {
        console.log('confirmed')
      } else {
        console.log('canceled')
      }
    })
  }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-seam-confirm-dialog-alert-service',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button"
        class="btn btn-lightgray"
        (click)="open()">
        Open Dialog
      </button>
    </div>`
})
export class StoryLibConfirmDialogAlertServiceComponent {

  @Input() msgText: string
  @Input() alertMsgText: string
  @Input() theme: ThemeTypes

  constructor(
    private _confirmDialog: SeamConfirmDialogService
  ) { }

  open() {
    if (this.theme) {
      this._confirmDialog.open(
        this.msgText,
        { message: this.alertMsgText, type: this.theme }
      ).afterClosed().subscribe(result => {
        if (result === 'confirm') {
          console.log('confirmed')
        } else {
          console.log('canceled')
        }
      })
    } else {
      this._confirmDialog.open(this.msgText).afterClosed()
        .subscribe(result => {
          if (result === 'confirm') {
            console.log('confirmed')
          } else {
            console.log('canceled')
          }
        })
    }
  }

}

storiesOf('Components|ConfirmDialog/Service', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      imports: [
        TheSeamConfirmDialogModule,
        BrowserAnimationsModule
      ],
    },
    component: StoryLibConfirmDialogBasicServiceComponent,
    props: {
      msgText: text('Message', 'Do you confirm?'),
    }
  }))

  .add('With Alert', () => ({
    moduleMetadata: {
      imports: [
        TheSeamConfirmDialogModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      msgText: text('Message', 'Do you confirm?'),
      alertMsgText: text('Alert Message', 'This is an alert'),
      theme: select('Theme', ThemeNames, 'warning'),
    },
    component: StoryLibConfirmDialogAlertServiceComponent
  }))
