import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { HierarchyRouterOutletComponent } from './hierarchy-router-outlet.component'

describe('HierarchyRouterOutletComponent', () => {
  let component: HierarchyRouterOutletComponent
  let fixture: ComponentFixture<HierarchyRouterOutletComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HierarchyRouterOutletComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyRouterOutletComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
