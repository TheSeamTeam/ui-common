import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SchemaFormInputComponent } from './schema-form-input.component'

describe('SchemaFormInputComponent', () => {
  let component: SchemaFormInputComponent
  let fixture: ComponentFixture<SchemaFormInputComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaFormInputComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaFormInputComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
