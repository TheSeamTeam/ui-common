import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TableCellTypeProgressCircleIconComponent } from './table-cell-type-progress-circle-icon.component'

describe('TableCellTypeProgressCircleIconComponent', () => {
  let component: TableCellTypeProgressCircleIconComponent
  let fixture: ComponentFixture<TableCellTypeProgressCircleIconComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellTypeProgressCircleIconComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellTypeProgressCircleIconComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
