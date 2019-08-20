import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DatatableCellTypeSelectorComponent } from './datatable-cell-type-selector.component'

describe('DatatableCellTypeSelectorComponent', () => {
  let component: DatatableCellTypeSelectorComponent
  let fixture: ComponentFixture<DatatableCellTypeSelectorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableCellTypeSelectorComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableCellTypeSelectorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
