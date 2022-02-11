import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TableCellTypeIntegerComponent } from './table-cell-type-integer.component'

describe('TableCellTypeIntegerComponent', () => {
  let component: TableCellTypeIntegerComponent
  let fixture: ComponentFixture<TableCellTypeIntegerComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellTypeIntegerComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellTypeIntegerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
