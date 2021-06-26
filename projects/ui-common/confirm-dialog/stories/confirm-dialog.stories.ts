// import { select, text, withKnobs } from '@storybook/addon-knobs'
import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { Component, Input } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { ThemeNames } from '@theseam/ui-common/models'
import type { ThemeTypes } from '@theseam/ui-common/models'

import { ConfirmDialogComponent } from '../confirm-dialog.component'
import { TheSeamConfirmDialogModule } from '../confirm-dialog.module'
import { SeamConfirmDialogService } from '../confirm-dialog.service'

export default {
  title: 'ConfirmDialog/Components/Directive',
  component: ConfirmDialogComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamConfirmDialogModule,
        BrowserAnimationsModule
      ]
    })
  ]
} as Meta

export const Basic: Story = (args) => ({
  props: {
    // msgText: text('Message', 'Do you confirm?'),
    confirmed() {
      console.log('Confirmed')
    }
  },
  template: `
    <button type="button"
      class="btn btn-lightgray"
      [seamConfirmMsg]="msgText"
      (seamConfirmClick)="confirmed()">
      Open Dialog
    </button>
  `
})

export const WithAlert: Story = (args) => ({
  props: {
    // msgText: text('Message', 'Do you confirm?'),
    // alertMsgText: text('Alert Message', 'This is an alert'),
    // theme: select('Theme', ThemeNames, 'warning'),
    confirmed() {
      console.log('Confirmed')
    }
  },
  template: `
    <button type="button"
      class="btn m-2"
      [seamConfirmMsg]="msgText"
      [seamConfirmAlert]="{ message: alertMsgText, type: theme }"
      (seamConfirmClick)="confirmed()">
      Open Dialog
    </button>
  `
})






// TODO: Convert all of the following to CSF

// storiesOf('Components/ConfirmDialog/Directive', module)
//   // .addDecorator(withKnobs)

//   .add('Basic', () => ({
//     moduleMetadata: {
//       imports: [
//         TheSeamConfirmDialogModule,
//         BrowserAnimationsModule
//       ]
//     },
//     props: {
//       // msgText: text('Message', 'Do you confirm?'),
//       confirmed() {
//         console.log('Confirmed')
//       }
//     },
//     template: `
//       <div class="p-4">
//         <button type="button"
//           class="btn btn-lightgray"
//           [seamConfirmMsg]="msgText"
//           (seamConfirmClick)="confirmed()">
//           Open Dialog
//         </button>
//       </div>
//       `
//   }))

//   .add('With Alert', () => ({
//     moduleMetadata: {
//       imports: [
//         TheSeamConfirmDialogModule,
//         BrowserAnimationsModule
//       ]
//     },
//     props: {
//       // msgText: text('Message', 'Do you confirm?'),
//       // alertMsgText: text('Alert Message', 'This is an alert'),
//       // theme: select('Theme', ThemeNames, 'warning'),
//       confirmed() {
//         console.log('Confirmed')
//       }
//     },
//     template: `
//       <div class="p-4">
//         <button type="button"
//           class="btn m-2"
//           [seamConfirmMsg]="msgText"
//           [seamConfirmAlert]="{ message: alertMsgText, type: theme }"
//           (seamConfirmClick)="confirmed()">
//           Open Dialog
//         </button>
//       </div>
//       `
//   }))






// @Component({
//   // tslint:disable-next-line:component-selector
//   selector: 'story-seam-confirm-dialog-basic-service',
//   styles: [],
//   template: `
//     <div class="p-4">
//       <button type="button"
//         class="btn btn-lightgray"
//         (click)="open()">
//         Open Dialog
//       </button>
//     </div>`
// })
// class StoryLibConfirmDialogBasicServiceComponent {

//   @Input() msgText: string | undefined

//   constructor(
//     private _confirmDialog: SeamConfirmDialogService
//   ) { }

//   open() {
//     this._confirmDialog.open(this.msgText).afterClosed().subscribe(result => {
//       if (result === 'confirm') {
//         console.log('confirmed')
//       } else {
//         console.log('canceled')
//       }
//     })
//   }

// }

// @Component({
//   // tslint:disable-next-line:component-selector
//   selector: 'story-seam-confirm-dialog-alert-service',
//   styles: [],
//   template: `
//     <div class="p-4">
//       <button type="button"
//         class="btn btn-lightgray"
//         (click)="open()">
//         Open Dialog
//       </button>
//     </div>`
// })
// class StoryLibConfirmDialogAlertServiceComponent {

//   @Input() msgText: string | undefined
//   @Input() alertMsgText: string | undefined
//   @Input() theme: ThemeTypes | undefined

//   constructor(
//     private _confirmDialog: SeamConfirmDialogService
//   ) { }

//   open() {
//     if (this.theme) {
//       this._confirmDialog.open(
//         this.msgText,
//         { message: this.alertMsgText || '', type: this.theme }
//       ).afterClosed().subscribe(result => {
//         if (result === 'confirm') {
//           console.log('confirmed')
//         } else {
//           console.log('canceled')
//         }
//       })
//     } else {
//       this._confirmDialog.open(this.msgText).afterClosed()
//         .subscribe(result => {
//           if (result === 'confirm') {
//             console.log('confirmed')
//           } else {
//             console.log('canceled')
//           }
//         })
//     }
//   }

// }


// export default {
//   title: 'Components/ConfirmDialog/Service',
//   component: ConfirmDialogComponent,
//   decorators: [
//     moduleMetadata({
//       imports: [
//         TheSeamConfirmDialogModule,
//         BrowserAnimationsModule
//       ]
//     })
//   ]
// } as Meta

// export const Basic: Story = (args) => ({
//   component: StoryLibConfirmDialogBasicServiceComponent,
//   props: {
//     // msgText: text('Message', 'Do you confirm?'),
//   }
// })

// export const WithAlert: Story = (args) => ({
//   props: {
//     // msgText: text('Message', 'Do you confirm?'),
//     // alertMsgText: text('Alert Message', 'This is an alert'),
//     // theme: select('Theme', ThemeNames, 'warning'),
//   },
//   component: StoryLibConfirmDialogAlertServiceComponent
// })







// storiesOf('Components/ConfirmDialog/Service', module)
//   // .addDecorator(withKnobs)

//   .add('Basic', () => ({
//     moduleMetadata: {
//       imports: [
//         TheSeamConfirmDialogModule,
//         BrowserAnimationsModule
//       ],
//     },
//     component: StoryLibConfirmDialogBasicServiceComponent,
//     props: {
//       // msgText: text('Message', 'Do you confirm?'),
//     }
//   }))

//   .add('With Alert', () => ({
//     moduleMetadata: {
//       imports: [
//         TheSeamConfirmDialogModule,
//         BrowserAnimationsModule
//       ]
//     },
//     props: {
//       // msgText: text('Message', 'Do you confirm?'),
//       // alertMsgText: text('Alert Message', 'This is an alert'),
//       // theme: select('Theme', ThemeNames, 'warning'),
//     },
//     component: StoryLibConfirmDialogAlertServiceComponent
//   }))
