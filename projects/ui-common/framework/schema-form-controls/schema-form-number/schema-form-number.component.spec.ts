import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TheSeamSchemaFormNumberComponent } from './schema-form-number.component'

describe('TheSeamSchemaFormNumberComponent', () => {
  let component: TheSeamSchemaFormNumberComponent
  let fixture: ComponentFixture<TheSeamSchemaFormNumberComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [TheSeamSchemaFormNumberComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TheSeamSchemaFormNumberComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
