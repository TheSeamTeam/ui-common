import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TheSeamSchemaFormInputComponent } from './schema-form-input.component'

describe('TheSeamSchemaFormInputComponent', () => {
  let component: TheSeamSchemaFormInputComponent
  let fixture: ComponentFixture<TheSeamSchemaFormInputComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TheSeamSchemaFormInputComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TheSeamSchemaFormInputComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
