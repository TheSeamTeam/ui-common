import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TableCellTypeProgressCircleComponent } from './table-cell-type-progress-circle.component'

describe('TableCellTypeProgressCircleComponent', () => {
  let component: TableCellTypeProgressCircleComponent
  let fixture: ComponentFixture<TableCellTypeProgressCircleComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [TableCellTypeProgressCircleComponent],
    teardown: { destroyAfterEach: false }
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
