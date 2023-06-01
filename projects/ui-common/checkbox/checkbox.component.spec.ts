import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TheSeamCheckboxComponent } from './checkbox.component'

describe('TheSeamCheckboxComponent', () => {
  let component: TheSeamCheckboxComponent
  let fixture: ComponentFixture<TheSeamCheckboxComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [TheSeamCheckboxComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TheSeamCheckboxComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
