import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TableCellTypeSelectorComponent } from './table-cell-type-selector.component'

describe('TableCellTypeSelectorComponent', () => {
  let component: TableCellTypeSelectorComponent
  let fixture: ComponentFixture<TableCellTypeSelectorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellTypeSelectorComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellTypeSelectorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
