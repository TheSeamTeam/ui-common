import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DatatableMenuBarComponent } from './datatable-menu-bar.component'

describe('DatatableMenuBarComponent', () => {
  let component: DatatableMenuBarComponent
  let fixture: ComponentFixture<DatatableMenuBarComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableMenuBarComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableMenuBarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
