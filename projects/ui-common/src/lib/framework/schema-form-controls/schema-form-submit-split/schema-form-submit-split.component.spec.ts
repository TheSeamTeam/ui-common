import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TheSeamSchemaFormSubmitSplitComponent } from './schema-form-submit-split.component'

describe('TheSeamSchemaFormSubmitSplitComponent', () => {
  let component: TheSeamSchemaFormSubmitSplitComponent
  let fixture: ComponentFixture<TheSeamSchemaFormSubmitSplitComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TheSeamSchemaFormSubmitSplitComponent ]
    })
    .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TheSeamSchemaFormSubmitSplitComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
