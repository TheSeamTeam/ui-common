import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { Component } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamOverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'

import { TheSeamModalModule } from '../modal.module'
import { Modal } from '../modal.service'

@Component({
  selector: 'story-seam-modal-basic',
  styles: [],
  template: `<span>Example</span>`
})
class StorySeamModalBasicComponent { }

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
    <seam-modal-body>
      Example
    </seam-modal-body>
    <seam-modal-footer>
      <button class="btn btn-primary" seamModalClose="Yes">Yes</button>
      <button class="btn btn-lightgray" seamModalClose="No">No</button>
    </seam-modal-footer>
  `,
  imports: [
    TheSeamModalModule,
  ],
})
class StorySeamModalSimpleComponent { }

@Component({
  selector: 'story-seam-modal-basic-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">Open</button>
    </div>
  `
})
class StorySeamModalBasicExampleComponent {

  constructor(
    private modal: Modal
  ) { }

  open() {
    const modalRef = this.modal.openFromComponent(StorySeamModalBasicComponent)

    // eslint-disable-next-line no-console
    modalRef.afterClosed().subscribe(v => console.log('result', v))
  }
}

@Component({
  selector: 'story-seam-modal-simple-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">Open</button>
    </div>
  `
})
class StorySeamModalSimpleExampleComponent {

  constructor(
    private modal: Modal
  ) { }

  open() {
    const modalRef = this.modal.openFromComponent(StorySeamModalSimpleComponent)

    // eslint-disable-next-line no-console
    modalRef.afterClosed().subscribe(v => console.log('result', v))
  }
}

const meta: Meta<any> = {
  title: 'Modal/Service',
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamModalModule,
        TheSeamOverlayScrollbarDirective,
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<any>

export const Basic: Story = {
  render: args => ({
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
  render: args => ({
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
