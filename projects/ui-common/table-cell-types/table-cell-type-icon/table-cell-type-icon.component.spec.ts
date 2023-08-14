import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TableCellTypeIconComponent } from './table-cell-type-icon.component'

describe('TableCellTypeIconComponent', () => {
  let component: TableCellTypeIconComponent
  let fixture: ComponentFixture<TableCellTypeIconComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [TableCellTypeIconComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellTypeIconComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
