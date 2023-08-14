import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TableCellTypeDateComponent } from './table-cell-type-date.component'

describe('TableCellTypeDateComponent', () => {
  let component: TableCellTypeDateComponent
  let fixture: ComponentFixture<TableCellTypeDateComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [TableCellTypeDateComponent],
    teardown: { destroyAfterEach: false }
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
