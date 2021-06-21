import { storiesOf } from '@storybook/angular'

import { Component } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamScrollbarModule } from '@theseam/ui-common/scrollbar'

import { ModalConfig } from '../modal-config'
import { TheSeamModalModule } from '../modal.module'
import { Modal } from '../modal.service'


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-seam-modal-basic',
  styles: [],
  template: `<span>Example</span>`
})
export class StoryseamModalBasicComponent { }

@Component({
  // tslint:disable-next-line:component-selector
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
export class StoryseamModalSimpleComponent { }

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-seam-modal-basic-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">Open</button>
    </div>
  `
})
export class StoryseamModalBasicExampleComponent {

  constructor(
    private modal: Modal
  ) { }

  open() {
    const modalRef = this.modal.openFromComponent(StoryseamModalBasicComponent)

    modalRef.afterClosed().subscribe(v => console.log('result', v))
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-seam-modal-simple-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">Open</button>
    </div>
  `
})
export class StoryseamModalSimpleExampleComponent {

  constructor(
    private modal: Modal
  ) { }

  open() {
    const modalRef = this.modal.openFromComponent(StoryseamModalSimpleComponent)

    modalRef.afterClosed().subscribe(v => console.log('result', v))
  }
}


storiesOf('Components/Modal/Service/Component', module)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        StoryseamModalBasicComponent,
        StoryseamModalBasicExampleComponent
      ],
      imports: [
        TheSeamModalModule,
        BrowserAnimationsModule,
        TheSeamScrollbarModule
      ],
      entryComponents: [
        StoryseamModalBasicComponent
      ],
    },
    props: { },
    template: `<story-seam-modal-basic-example></story-seam-modal-basic-example>`
  }))

  .add('Simple', () => ({
    moduleMetadata: {
      declarations: [
        StoryseamModalSimpleComponent,
        StoryseamModalSimpleExampleComponent
      ],
      imports: [
        TheSeamModalModule,
        BrowserAnimationsModule,
        TheSeamScrollbarModule
      ],
      entryComponents: [
        StoryseamModalSimpleComponent
      ],
    },
    props: { },
    template: `<story-seam-modal-simple-example></story-seam-modal-simple-example>`
  }))




storiesOf('Components/Modal/Directive/Template', module)

  .add('Basic', () => ({
    moduleMetadata: {
      imports: [
        TheSeamModalModule,
        BrowserAnimationsModule,
        TheSeamScrollbarModule
      ]
    },
    props: { },
    template: `
      <div class="p-4">
        <button type="button" class="btn btn-lightgray"
          (click)="modal.open()">Open Modal</button>
      </div>

      <ng-template seamModal #modal="seamModal">
        Example
      </ng-template>
      `
  }))

  .add('Simple', () => ({
    moduleMetadata: {
      imports: [
        TheSeamModalModule,
        BrowserAnimationsModule,
        TheSeamScrollbarModule
      ]
    },
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
      </ng-template>
      `
  }))
