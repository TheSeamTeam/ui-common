import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TableCellTypeDateComponent } from './table-cell-type-date.component'

describe('TableCellTypeDateComponent', () => {
  let component: TableCellTypeDateComponent
  let fixture: ComponentFixture<TableCellTypeDateComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellTypeDateComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellTypeDateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
