import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamScrollbarModule } from '@theseam/ui-common/scrollbar'

import { TheSeamModalModule } from '../modal.module'

export default {
  title: 'Modal/Directive/Template',
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamModalModule,
        BrowserAnimationsModule,
        TheSeamScrollbarModule
      ],
    })
  ]
} as Meta

export const Basic: Story = () => ({
  props: { },
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray"
        (click)="modal.open()">Open Modal</button>
    </div>

    <ng-template seamModal #modal="seamModal">
      Example
    </ng-template>`
})

export const Simple: Story = () => ({
  props: { },
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray"
        (click)="modal.open()">Open Modal</button>
    </div>

    <ng-template seamModal #modal="seamModal">
      <seam-modal-header>
        <h4 seamModalTitle>Title</h4>
        <button seamModalClose="cancel" class="close" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </seam-modal-header>
      <seam-modal-body>
        Example
      </seam-modal-body>
      <seam-modal-footer>
        <button class="btn btn-primary" seamModalClose="Yes">Yes</button>
        <button class="btn btn-lightgray" seamModalClose="No">No</button>
      </seam-modal-footer>
    </ng-template>`
})
