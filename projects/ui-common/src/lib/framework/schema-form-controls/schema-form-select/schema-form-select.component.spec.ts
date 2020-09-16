import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SchemaFormSelectComponent } from './schema-form-select.component'

describe('SchemaFormSelectComponent', () => {
  let component: SchemaFormSelectComponent
  let fixture: ComponentFixture<SchemaFormSelectComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaFormSelectComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaFormSelectComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
