import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DatatableDynamicActionMenuComponent } from './datatable-dynamic-action-menu.component'

describe('DatatableDynamicActionMenuComponent', () => {
  let component: DatatableDynamicActionMenuComponent
  let fixture: ComponentFixture<DatatableDynamicActionMenuComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableDynamicActionMenuComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableDynamicActionMenuComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
