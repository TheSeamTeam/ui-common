import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TheSeamSchemaFormCheckboxComponent } from './schema-form-checkbox.component'

describe('TheSeamSchemaFormCheckboxComponent', () => {
  let component: TheSeamSchemaFormCheckboxComponent
  let fixture: ComponentFixture<TheSeamSchemaFormCheckboxComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [TheSeamSchemaFormCheckboxComponent],
    teardown: { destroyAfterEach: false }
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
