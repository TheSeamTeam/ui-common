import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DatatableCellTypeIconComponent } from './datatable-cell-type-icon.component'

describe('DatatableCellTypeIconComponent', () => {
  let component: DatatableCellTypeIconComponent
  let fixture: ComponentFixture<DatatableCellTypeIconComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableCellTypeIconComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableCellTypeIconComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
