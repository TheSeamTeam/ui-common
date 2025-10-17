import {
  Meta,
  moduleMetadata,
  StoryObj,
  applicationConfig,
} from '@storybook/angular'

import { Component, inject, Input } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'

import { ThemeNames, ThemeTypes } from '@theseam/ui-common/models'
import { TheSeamModalModule } from '@theseam/ui-common/modal'

import { ConfirmDialogComponent } from './confirm-dialog.component'
import { TheSeamConfirmDialogModule } from './confirm-dialog.module'
import { SeamConfirmDialogService } from './confirm-dialog.service'

@Component({
  selector: 'story-seam-confirm-dialog-basic-service',
  template: ` <button type="button" class="btn btn-lightgray" (click)="open()">
    Open Dialog
  </button>`,
})
class StoryLibConfirmDialogBasicServiceComponent {
  private readonly _confirmDialog = inject(SeamConfirmDialogService)

  @Input() msgText: string | undefined

  open() {
    this._confirmDialog
      .open(this.msgText)
      .afterClosed()
      .subscribe((result) => {
        if (result === 'confirm') {
          console.log('confirmed')
        } else {
          console.log('canceled')
        }
      })
  }
}

@Component({
  selector: 'story-seam-confirm-dialog-alert-service',
  template: ` <button type="button" class="btn btn-lightgray" (click)="open()">
    Open Dialog
  </button>`,
})
class StoryLibConfirmDialogAlertServiceComponent {
  private readonly _confirmDialog = inject(SeamConfirmDialogService)

  @Input() msgText: string | undefined
  @Input() alertMsgText: string | undefined
  @Input() theme: ThemeTypes | undefined

  open() {
    if (this.theme) {
      this._confirmDialog
        .open(this.msgText, {
          message: this.alertMsgText || '',
          type: this.theme,
        })
        .afterClosed()
        .subscribe((result) => {
          if (result === 'confirm') {
            console.log('confirmed')
          } else {
            console.log('canceled')
          }
        })
    } else {
      this._confirmDialog
        .open(this.msgText)
        .afterClosed()
        .subscribe((result) => {
          if (result === 'confirm') {
            console.log('confirmed')
          } else {
            console.log('canceled')
          }
        })
    }
  }
}

interface ExtraArgs {
  msgText: string
  alertMsgText: string
  alertTheme: ThemeTypes
}

const meta: Meta<ConfirmDialogComponent & ExtraArgs> = {
  title: 'Confirm Dialog/Components/Service',
  component: ConfirmDialogComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      imports: [TheSeamConfirmDialogModule, TheSeamModalModule],
    }),
  ],
}

export default meta
type Story = StoryObj<ConfirmDialogComponent & ExtraArgs>

export const Basic: Story = {
  decorators: [
    moduleMetadata({
      imports: [StoryLibConfirmDialogBasicServiceComponent],
    }),
  ],
  render: (args) => ({
    props: { ...args },
    template: `
      <story-seam-confirm-dialog-basic-service
        [msgText]="msgText"
      ></story-seam-confirm-dialog-basic-service>`,
  }),
  args: {
    msgText: 'Do you confirm?',
  },
}

export const WithAlert: Story = {
  decorators: [
    moduleMetadata({
      imports: [StoryLibConfirmDialogAlertServiceComponent],
    }),
  ],
  render: (args) => ({
    props: { ...args },
    template: `
      <story-seam-confirm-dialog-alert-service
        [msgText]="msgText"
        [alertMsgText]="alertMsgText"
        [theme]="alertTheme"
      ></story-seam-confirm-dialog-alert-service>`,
  }),
  args: {
    msgText: 'Do you confirm?',
    alertMsgText: 'This is an alert',
    alertTheme: 'warning',
  },
  argTypes: {
    alertTheme: { control: 'select', options: ThemeNames },
  },
}
