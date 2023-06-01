import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TheSeamSchemaFormSelectComponent } from './schema-form-select.component'

describe('TheSeamSchemaFormSelectComponent', () => {
  let component: TheSeamSchemaFormSelectComponent
  let fixture: ComponentFixture<TheSeamSchemaFormSelectComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [TheSeamSchemaFormSelectComponent],
    teardown: { destroyAfterEach: false }
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
