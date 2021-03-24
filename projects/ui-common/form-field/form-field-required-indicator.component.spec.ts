import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { FormFieldRequiredIndicatorComponent } from './form-field-required-indicator.component'

describe('FormFieldRequiredIndicatorComponent', () => {
  let component: FormFieldRequiredIndicatorComponent
  let fixture: ComponentFixture<FormFieldRequiredIndicatorComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormFieldRequiredIndicatorComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFieldRequiredIndicatorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
