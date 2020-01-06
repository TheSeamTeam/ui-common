import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TheSeamCheckboxComponent } from './checkbox.component'

describe('TheSeamCheckboxComponent', () => {
  let component: TheSeamCheckboxComponent
  let fixture: ComponentFixture<TheSeamCheckboxComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TheSeamCheckboxComponent ]
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
