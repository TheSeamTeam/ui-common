import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TheSeamSchemaFormCheckboxComponent } from './schema-form-checkbox.component'

describe('TheSeamSchemaFormCheckboxComponent', () => {
  let component: TheSeamSchemaFormCheckboxComponent
  let fixture: ComponentFixture<TheSeamSchemaFormCheckboxComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TheSeamSchemaFormCheckboxComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TheSeamSchemaFormCheckboxComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
