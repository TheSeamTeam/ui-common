import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TableCellTypeDecimalComponent } from './table-cell-type-decimal.component'

describe('TableCellTypeDecimalComponent', () => {
  let component: TableCellTypeDecimalComponent
  let fixture: ComponentFixture<TableCellTypeDecimalComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellTypeDecimalComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellTypeDecimalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
