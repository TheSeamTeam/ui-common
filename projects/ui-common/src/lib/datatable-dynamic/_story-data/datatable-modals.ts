import { CommonModule } from '@angular/common'
import { Component, Inject, NgModule, Optional } from '@angular/core'

import { TheSeamDynamicComponentLoaderModule } from '../../dynamic-component-loader/index'
import { MODAL_DATA, TheSeamModalModule } from '../../modal/index'

//
//
//
@Component({
  template: `
    <seam-modal-header>
      <h4 seamModalTitle class="d-flex flex-column">
        StoryMessagesModal
      </h4>
      <button type="button" class="close" aria-label="Close" data-dismiss="modal" seamModalClose>
        <span aria-hidden="true">&times;</span>
      </button>
    </seam-modal-header>
    <seam-modal-body>
      <pre *ngIf="data">{{ data | json }}</pre>
    </seam-modal-body>
    <seam-modal-footer>
      <button type="button" class="btn btn-lightgray" data-dismiss="modal" seamModalClose="reply">Reply</button>
      <button type="button" class="btn btn-primary" data-dismiss="modal" seamModalClose>Close</button>
    </seam-modal-footer>
  `
})
export class StoryMessagesModalComponent {
  constructor(
    @Optional() @Inject(MODAL_DATA) public data?: any
  ) { console.log('[StoryMessagesModalComponent] data', data) }
}

@NgModule({
  imports: [
    CommonModule,
    TheSeamModalModule,
    TheSeamDynamicComponentLoaderModule.forChild(StoryMessagesModalComponent),
  ],
  declarations: [
    StoryMessagesModalComponent
  ],
  entryComponents: [
    StoryMessagesModalComponent
  ]
})
export class StoryMessagesModalModule { }

//
//
//
@Component({
  template: `
    <seam-modal-header>
      <h4 seamModalTitle class="d-flex flex-column">
        StoryMessagesCreate
      </h4>
      <button type="button" class="close" aria-label="Close" data-dismiss="modal" seamModalClose>
        <span aria-hidden="true">&times;</span>
      </button>
    </seam-modal-header>
    <seam-modal-body>
      <pre *ngIf="data">{{ data | json }}</pre>
    </seam-modal-body>
    <seam-modal-footer>
    <button type="button" class="btn btn-lightgray" data-dismiss="modal" seamModalClose>Close</button>
    <button type="button" class="btn btn-primary" data-dismiss="modal" seamModalClose>Continue</button>
    </seam-modal-footer>
  `
})
export class StoryMessagesCreateModalComponent {
  constructor(
    @Optional() @Inject(MODAL_DATA) public data?: any
  ) { console.log('[StoryMessagesCreateModalComponent] data', data) }
}

@NgModule({
  imports: [
    CommonModule,
    TheSeamModalModule,
    TheSeamDynamicComponentLoaderModule.forChild(StoryMessagesCreateModalComponent),
  ],
  declarations: [
    StoryMessagesCreateModalComponent
  ],
  entryComponents: [
    StoryMessagesCreateModalComponent
  ]
})
export class StoryMessagesCreateModalModule { }

