import { inject, TestBed, waitForAsync } from '@angular/core/testing'

import { UnsavedChangesDialogGuard } from './unsaved-changes-dialog.guard'

describe('UnsavedChangesDialogGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    providers: [UnsavedChangesDialogGuard],
    teardown: { destroyAfterEach: false }
})
  })

  it('should ...', inject([UnsavedChangesDialogGuard], (guard: UnsavedChangesDialogGuard) => {
    expect(guard).toBeTruthy()
  }))
})
