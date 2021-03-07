import { CommonModule } from '@angular/common'
import { Component, Inject, NgModule, Optional } from '@angular/core'

import { TheSeamDynamicComponentLoaderModule } from '@lib/ui-common/dynamic-component-loader'
import { MODAL_DATA, TheSeamModalModule } from '../../modal/index'

//
//
//
@Component({
  template: `
    <seam-modal-header>
      <h4 seamModalTitle class="d-flex flex-column">
        Story Modal 1
      </h4>
      <button type="button" class="close" aria-label="Close" data-dismiss="modal" seamModalClose>
        <span aria-hidden="true">&times;</span>
      </button>
    </seam-modal-header>
    <seam-modal-body>
      <pre *ngIf="data">{{ data | json }}</pre>
    </seam-modal-body>
    <seam-modal-footer>
      <button type="button" class="btn btn-lightgray" data-dismiss="modal" seamModalClose="next-modal">Next Modal</button>
      <button type="button" class="btn btn-primary" data-dismiss="modal" seamModalClose>Close</button>
    </seam-modal-footer>
  `
})
export class StoryModalOneComponent {
  constructor(
    @Optional() @Inject(MODAL_DATA) public data?: any
  ) { console.log('[StoryModalOneComponent] data', data) }
}

@NgModule({
  imports: [
    CommonModule,
    TheSeamModalModule,
    TheSeamDynamicComponentLoaderModule.forChild(StoryModalOneComponent),
  ],
  declarations: [
    StoryModalOneComponent
  ],
  entryComponents: [
    StoryModalOneComponent
  ]
})
export class StoryModalOneModule { }

//
//
//
@Component({
  template: `
    <seam-modal-header>
      <h4 seamModalTitle class="d-flex flex-column">
        Story Modal 2
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
export class StoryModalTwoComponent {
  constructor(
    @Optional() @Inject(MODAL_DATA) public data?: any
  ) { console.log('[StoryModalTwoComponent] data', data) }
}

@NgModule({
  imports: [
    CommonModule,
    TheSeamModalModule,
    TheSeamDynamicComponentLoaderModule.forChild(StoryModalTwoComponent),
  ],
  declarations: [
    StoryModalTwoComponent
  ],
  entryComponents: [
    StoryModalTwoComponent
  ]
})
export class StoryModalTwoModule { }

