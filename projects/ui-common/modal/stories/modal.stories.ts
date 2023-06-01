import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { Component } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamScrollbarModule } from '@theseam/ui-common/scrollbar'

import { TheSeamModalModule } from '../modal.module'
import { Modal } from '../modal.service'

@Component({
  selector: 'story-seam-modal-basic',
  styles: [],
  template: `<span>Example</span>`
})
class StoryseamModalBasicComponent { }

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
  `
})
class StoryseamModalSimpleComponent { }

@Component({
  selector: 'story-seam-modal-basic-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">Open</button>
    </div>
  `
})
class StoryseamModalBasicExampleComponent {

  constructor(
    private modal: Modal
  ) { }

  open() {
    const modalRef = this.modal.openFromComponent(StoryseamModalBasicComponent)

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
class StoryseamModalSimpleExampleComponent {

  constructor(
    private modal: Modal
  ) { }

  open() {
    const modalRef = this.modal.openFromComponent(StoryseamModalSimpleComponent)

    // eslint-disable-next-line no-console
    modalRef.afterClosed().subscribe(v => console.log('result', v))
  }
}

export default {
  title: 'Modal/Service',
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
  moduleMetadata: {
    declarations: [
      StoryseamModalBasicComponent,
      StoryseamModalBasicExampleComponent
    ],
    entryComponents: [
      StoryseamModalBasicComponent
    ],
  },
  props: { },
  template: `<story-seam-modal-basic-example></story-seam-modal-basic-example>`
})

export const Simple: Story = () => ({
  moduleMetadata: {
    declarations: [
      StoryseamModalSimpleComponent,
      StoryseamModalSimpleExampleComponent
    ],
    entryComponents: [
      StoryseamModalSimpleComponent
    ],
  },
  props: { },
  template: `<story-seam-modal-simple-example></story-seam-modal-simple-example>`
})
