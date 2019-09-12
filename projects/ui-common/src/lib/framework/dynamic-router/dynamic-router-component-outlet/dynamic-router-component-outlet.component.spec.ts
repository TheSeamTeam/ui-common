import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DynamicRouterComponentOutletComponent } from './dynamic-router-component-outlet.component'

describe('DynamicRouterComponentOutletComponent', () => {
  let component: DynamicRouterComponentOutletComponent
  let fixture: ComponentFixture<DynamicRouterComponentOutletComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicRouterComponentOutletComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicRouterComponentOutletComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
