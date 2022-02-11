import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TableCellTypeCurrencyComponent } from './table-cell-type-currency.component'

describe('TableCellTypeCurrencyComponent', () => {
  let component: TableCellTypeCurrencyComponent
  let fixture: ComponentFixture<TableCellTypeCurrencyComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellTypeCurrencyComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellTypeCurrencyComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
