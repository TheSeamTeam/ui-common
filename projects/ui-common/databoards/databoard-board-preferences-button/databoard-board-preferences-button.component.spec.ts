import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DataboardBoardPreferencesButtonComponent } from './databoard-board-preferences-button.component'

describe('DataboardBoardPreferencesButtonComponent', () => {
  let component: DataboardBoardPreferencesButtonComponent
  let fixture: ComponentFixture<DataboardBoardPreferencesButtonComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DataboardBoardPreferencesButtonComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DataboardBoardPreferencesButtonComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
