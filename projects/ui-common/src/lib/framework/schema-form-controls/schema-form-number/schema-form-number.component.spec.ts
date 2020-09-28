import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SchemaFormNumberComponent } from './schema-form-number.component'

describe('SchemaFormNumberComponent', () => {
  let component: SchemaFormNumberComponent
  let fixture: ComponentFixture<SchemaFormNumberComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaFormNumberComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaFormNumberComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
