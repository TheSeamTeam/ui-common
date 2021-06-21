import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DatatableMenuBarColumnCenterComponent } from './datatable-menu-bar-column-center.component'

describe('DatatableMenuBarColumnCenterComponent', () => {
  let component: DatatableMenuBarColumnCenterComponent
  let fixture: ComponentFixture<DatatableMenuBarColumnCenterComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableMenuBarColumnCenterComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableMenuBarColumnCenterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
