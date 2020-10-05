import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SchemaFormCheckboxComponent } from './schema-form-checkbox.component'

describe('SchemaFormCheckboxComponent', () => {
  let component: SchemaFormCheckboxComponent
  let fixture: ComponentFixture<SchemaFormCheckboxComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaFormCheckboxComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaFormCheckboxComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
