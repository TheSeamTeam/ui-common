import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TableCellTypeSelectorComponent } from './table-cell-type-selector.component'

describe('TableCellTypeSelectorComponent', () => {
  let component: TableCellTypeSelectorComponent
  let fixture: ComponentFixture<TableCellTypeSelectorComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [TableCellTypeSelectorComponent],
    teardown: { destroyAfterEach: false }
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
