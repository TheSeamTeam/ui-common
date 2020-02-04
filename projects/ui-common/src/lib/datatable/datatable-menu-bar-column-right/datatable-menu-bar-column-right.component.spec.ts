import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DatatableMenuBarColumnRightComponent } from './datatable-menu-bar-column-right.component'

describe('DatatableMenuBarColumnRightComponent', () => {
  let component: DatatableMenuBarColumnRightComponent
  let fixture: ComponentFixture<DatatableMenuBarColumnRightComponent>

  beforeEach(async(() => {
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
