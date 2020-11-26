import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TheSeamSchemaFormSelectComponent } from './schema-form-select.component'

describe('TheSeamSchemaFormSelectComponent', () => {
  let component: TheSeamSchemaFormSelectComponent
  let fixture: ComponentFixture<TheSeamSchemaFormSelectComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TheSeamSchemaFormSelectComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TheSeamSchemaFormSelectComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
