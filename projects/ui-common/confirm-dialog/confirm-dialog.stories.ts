import {
  Meta,
  moduleMetadata,
  StoryObj,
  applicationConfig,
} from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { ThemeNames, ThemeTypes } from '@theseam/ui-common/models'

import { ConfirmDialogComponent } from './confirm-dialog.component'
import { TheSeamConfirmDialogModule } from './confirm-dialog.module'

interface ExtraArgs {
  msgText: string
  alertMsgText: string
  alertTheme: ThemeTypes
}

const meta: Meta<ConfirmDialogComponent & ExtraArgs> = {
  title: 'Confirm Dialog/Components/Directive',
  component: ConfirmDialogComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      imports: [TheSeamConfirmDialogModule],
    }),
  ],
}

export default meta
type Story = StoryObj<ConfirmDialogComponent & ExtraArgs>

export const Basic: Story = {
  render: (args) => ({
    props: {
      // msgText: text('Message', 'Do you confirm?'),
      confirmed() {
        // eslint-disable-next-line no-console
        console.log('Confirmed')
      },
    },
    template: `
      <button type="button"
        class="btn btn-lightgray"
        [seamConfirmMsg]="msgText"
        (seamConfirmClick)="confirmed()">
        Open Dialog
      </button>
    `,
  }),
}

export const WithAlert: Story = {
  render: (args) => ({
    props: {
      // msgText: text('Message', 'Do you confirm?'),
      // alertMsgText: text('Alert Message', 'This is an alert'),
      // theme: select('Theme', ThemeNames, 'warning'),
      ...args,
      confirmed() {
        // eslint-disable-next-line no-console
        console.log('Confirmed')
      },
    },
    template: `
      <button type="button"
        class="btn m-2"
        [seamConfirmMsg]="msgText"
        [seamConfirmAlert]="{ message: alertMsgText, type: alertTheme }"
        (seamConfirmClick)="confirmed()">
        Open Dialog
      </button>
    `,
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

export const WithTemplate: Story = {
  render: (args) => ({
    props: {
      // msgText: text('Message', 'Do you confirm?'),
      confirmed() {
        // eslint-disable-next-line no-console
        console.log('Confirmed')
      },
    },
    template: `
      <ng-template #confirmTpl>
        <h2>Do you want to continue?</h2>
        <hr/>
        <small>This confirmation message uses a custom template.</small>
      </ng-template>

      <button type="button"
        class="btn btn-lightgray"
        [seamConfirmTpl]="confirmTpl"
        (seamConfirmClick)="confirmed()">
        Open Dialog
      </button>
    `,
  }),
}

export const WithTemplateAndTemplateData: Story = {
  render: (args) => ({
    props: {
      // msgText: text('Message', 'Do you confirm?'),
      confirmed() {
        // eslint-disable-next-line no-console
        console.log('Confirmed')
      },
    },
    template: `
      <ng-template #confirmTpl let-context>
        <h2>Do you want to continue?</h2>
        <hr/>
        <small>This will affect {{context.recordsAffected}} records.</small>
      </ng-template>

      <button type="button"
        class="btn btn-lightgray"
        [seamConfirmTpl]="{ template: confirmTpl, context: { recordsAffected: 123 }}"
        (seamConfirmClick)="confirmed()">
        Open Dialog
      </button>
    `,
  }),
}
