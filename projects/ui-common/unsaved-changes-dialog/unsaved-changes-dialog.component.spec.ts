import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { UnsavedChangesDialogComponent } from './unsaved-changes-dialog.component'

describe('UnsavedChangesDialogComponent', () => {
  let component: UnsavedChangesDialogComponent
  let fixture: ComponentFixture<UnsavedChangesDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [UnsavedChangesDialogComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsavedChangesDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
