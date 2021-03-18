import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TheSeamTelInputComponent } from './tel-input.component'

describe('TheSeamTelInputComponent', () => {
  let component: TheSeamTelInputComponent
  let fixture: ComponentFixture<TheSeamTelInputComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TheSeamTelInputComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TheSeamTelInputComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
