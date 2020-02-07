import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DatatableMenuBarRowComponent } from './datatable-menu-bar-row.component'

describe('DatatableMenuBarRowComponent', () => {
  let component: DatatableMenuBarRowComponent
  let fixture: ComponentFixture<DatatableMenuBarRowComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableMenuBarRowComponent ]
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
