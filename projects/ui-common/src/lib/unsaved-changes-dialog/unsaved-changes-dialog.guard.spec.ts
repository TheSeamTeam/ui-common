import { async, inject, TestBed } from '@angular/core/testing'

import { UnsavedChangesDialogGuard } from './unsaved-changes-dialog.guard'

describe('UnsavedChangesDialogGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnsavedChangesDialogGuard]
    })
  })

  it('should ...', inject([UnsavedChangesDialogGuard], (guard: UnsavedChangesDialogGuard) => {
    expect(guard).toBeTruthy()
  }))
})
