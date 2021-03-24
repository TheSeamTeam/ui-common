import { TestBed } from '@angular/core/testing'

import { TheSeamModalModule } from '@theseam/ui-common/modal'

import { SeamConfirmDialogService } from './confirm-dialog.service'

describe('SeamConfirmDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ TheSeamModalModule ],
    providers: [ SeamConfirmDialogService ]
  }))

  it('should be created', () => {
    const service: SeamConfirmDialogService = TestBed.get(SeamConfirmDialogService)
    expect(service).toBeTruthy()
  })
})
