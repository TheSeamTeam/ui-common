import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DatatableMenuBarRowComponent } from './datatable-menu-bar-row.component'

describe('DatatableMenuBarRowComponent', () => {
  let component: DatatableMenuBarRowComponent
  let fixture: ComponentFixture<DatatableMenuBarRowComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DatatableMenuBarRowComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableMenuBarRowComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
