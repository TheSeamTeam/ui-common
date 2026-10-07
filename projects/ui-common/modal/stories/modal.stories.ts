import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Component, inject } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'
import { map } from 'rxjs'

import { SeamConfirmDialogService } from '@theseam/ui-common/confirm-dialog'
import { TheSeamOverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'

import { ModalRef } from '../modal-ref'
import { TheSeamModalModule } from '../modal.module'
import { Modal } from '../modal.service'

@Component({
  selector: 'story-seam-modal-basic',
  styles: [],
  template: `<span>Example</span>`,
})
class StorySeamModalBasicComponent {}

@Component({
  selector: 'story-seam-modal-simple',
  styles: [],
  template: `
    <seam-modal-header>
      <h4 seamModalTitle>Title</h4>
      <button seamModalClose="cancel" class="close" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </seam-modal-header>
    <seam-modal-body> Example </seam-modal-body>
    <seam-modal-footer>
      <button class="btn btn-primary" seamModalClose="Yes">Yes</button>
      <button class="btn btn-lightgray" seamModalClose="No">No</button>
    </seam-modal-footer>
  `,
  imports: [TheSeamModalModule],
})
class StorySeamModalSimpleComponent {}

@Component({
  selector: 'story-seam-modal-basic-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">
        Open
      </button>
    </div>
  `,
})
class StorySeamModalBasicExampleComponent {
  constructor(private modal: Modal) {}

  open() {
    const modalRef = this.modal.openFromComponent(StorySeamModalBasicComponent)

    // eslint-disable-next-line no-console
    modalRef.afterClosed().subscribe((v) => console.log('result', v))
  }
}

@Component({
  selector: 'story-seam-modal-simple-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">
        Open
      </button>
    </div>
  `,
})
class StorySeamModalSimpleExampleComponent {
  constructor(private modal: Modal) {}

  open() {
    const modalRef = this.modal.openFromComponent(StorySeamModalSimpleComponent)

    // eslint-disable-next-line no-console
    modalRef.afterClosed().subscribe((v) => console.log('result', v))
  }
}

@Component({
  selector: 'story-seam-modal-unsaved-changes',
  styles: [],
  template: `
    <seam-modal-header>
      <h4 seamModalTitle>Edit Name</h4>
      <button seamModalClose class="close" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </seam-modal-header>
    <seam-modal-body>
      <label for="story-unsaved-name">Name</label>
      <input
        id="story-unsaved-name"
        class="form-control"
        [formControl]="name"
      />
    </seam-modal-body>
    <seam-modal-footer>
      <button class="btn btn-primary" seamModalClose="saved">Save</button>
      <button class="btn btn-lightgray" seamModalClose>Cancel</button>
    </seam-modal-footer>
  `,
  imports: [TheSeamModalModule, ReactiveFormsModule],
})
class StorySeamModalUnsavedChangesComponent {
  private readonly _modalRef = inject(ModalRef)
  private readonly _confirmDialog = inject(SeamConfirmDialogService)

  readonly name = new FormControl('Example')

  constructor() {
    this._modalRef.canClose = (reason, result) => {
      if (result === 'saved' || !this.name.dirty) {
        return true
      }
      return this._confirmDialog
        .open('You have unsaved changes. Discard them?')
        .afterClosed()
        .pipe(map((answer) => answer === 'confirm'))
    }
  }
}

@Component({
  selector: 'story-seam-modal-unsaved-changes-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">
        Open
      </button>
      <p class="mt-2">Result: {{ result ?? '(none)' }}</p>
    </div>
  `,
})
class StorySeamModalUnsavedChangesExampleComponent {
  private readonly _modal = inject(Modal)

  result: string | undefined

  open() {
    this.result = undefined
    this._modal
      .openFromComponent(StorySeamModalUnsavedChangesComponent)
      .afterClosed()
      .subscribe((v) => (this.result = v ?? 'closed'))
  }
}

const meta: Meta<any> = {
  title: 'Modal/Service',
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      imports: [TheSeamModalModule, TheSeamOverlayScrollbarDirective],
    }),
  ],
}

export default meta
type Story = StoryObj<any>

export const Basic: Story = {
  render: (args) => ({
    moduleMetadata: {
      imports: [
        StorySeamModalBasicComponent,
        StorySeamModalBasicExampleComponent,
      ],
    },
    props: args,
    template: `<story-seam-modal-basic-example></story-seam-modal-basic-example>`,
  }),
}

export const Simple: Story = {
  render: (args) => ({
    moduleMetadata: {
      imports: [
        StorySeamModalSimpleComponent,
        StorySeamModalSimpleExampleComponent,
      ],
    },
    props: args,
    template: `<story-seam-modal-simple-example></story-seam-modal-simple-example>`,
  }),
}

/**
 * Uses `canClose` to ask before discarding unsaved changes. Clicking outside,
 * pressing Escape, the X, and Cancel all ask once the name has been edited.
 * Save closes without asking.
 */
export const UnsavedChanges: Story = {
  render: (args) => ({
    moduleMetadata: {
      imports: [StorySeamModalUnsavedChangesExampleComponent],
    },
    props: args,
    template: `<story-seam-modal-unsaved-changes-example></story-seam-modal-unsaved-changes-example>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The modals render in the CDK overlay container, outside the canvas.
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByText('Open'))
    const input = await body.findByLabelText('Name')
    await userEvent.type(input, ' changed')

    // Cancel asks first, and answering "No" keeps the modal open.
    await userEvent.click(body.getByText('Cancel'))
    await userEvent.click(await body.findByText('No'))
    await waitFor(() => expect(body.queryByText('No')).toBeNull())
    await expect(body.getByLabelText('Name')).toBeInTheDocument()

    // Save closes without asking.
    await userEvent.click(body.getByText('Save'))
    await waitFor(() => expect(canvas.getByText('Result: saved')).toBeVisible())
  },
}
