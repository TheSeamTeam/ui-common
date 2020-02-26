import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DatatableDynamicMenuBarContentComponent } from './datatable-dynamic-menu-bar-content.component'

describe('DatatableDynamicMenuBarContentComponent', () => {
  let component: DatatableDynamicMenuBarContentComponent
  let fixture: ComponentFixture<DatatableDynamicMenuBarContentComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableDynamicMenuBarContentComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableDynamicMenuBarContentComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
