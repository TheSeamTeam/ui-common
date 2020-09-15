import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DatatableMenuBarTextComponent } from './datatable-menu-bar-text.component'

describe('DatatableMenuBarTextComponent', () => {
  let component: DatatableMenuBarTextComponent
  let fixture: ComponentFixture<DatatableMenuBarTextComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableMenuBarTextComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableMenuBarTextComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
