import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DatatableMenuBarColumnRightComponent } from './datatable-menu-bar-column-right.component'

describe('DatatableMenuBarColumnRightComponent', () => {
  let component: DatatableMenuBarColumnRightComponent
  let fixture: ComponentFixture<DatatableMenuBarColumnRightComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableMenuBarColumnRightComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableMenuBarColumnRightComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
