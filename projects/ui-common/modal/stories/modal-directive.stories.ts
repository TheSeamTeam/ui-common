import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamScrollbarModule } from '@theseam/ui-common/scrollbar'

import { TheSeamModalModule } from '../modal.module'

const meta: Meta<any> = {
  title: 'Modal/Directive/Template',
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamModalModule,
        TheSeamScrollbarModule
      ],
    })
  ]
}

export default meta
type Story = StoryObj<any>

export const Basic: Story = {
  render: args => ({
    props: args,
    template: `
      <div class="p-4">
        <button type="button" class="btn btn-lightgray"
          (click)="modal.open()">Open Modal</button>
      </div>

      <ng-template seamModal #modal="seamModal">
        Example
      </ng-template>`
  }),
}

export const Simple: Story = {
  render: args => ({
    props: args,
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
  }),
}
