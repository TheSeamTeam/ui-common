import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DatatableMenuBarColumnLeftComponent } from './datatable-menu-bar-column-left.component'

describe('DatatableMenuBarColumnLeftComponent', () => {
  let component: DatatableMenuBarColumnLeftComponent
  let fixture: ComponentFixture<DatatableMenuBarColumnLeftComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableMenuBarColumnLeftComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableMenuBarColumnLeftComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
