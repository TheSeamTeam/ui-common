import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TableCellTypeProgressCircleComponent } from './table-cell-type-progress-circle.component'

describe('TableCellTypeProgressCircleComponent', () => {
  let component: TableCellTypeProgressCircleComponent
  let fixture: ComponentFixture<TableCellTypeProgressCircleComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellTypeProgressCircleComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellTypeProgressCircleComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
