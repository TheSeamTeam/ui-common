import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DatatableDynamicMenuBarContentComponent } from './datatable-dynamic-menu-bar-content.component'

describe('DatatableDynamicMenuBarContentComponent', () => {
  let component: DatatableDynamicMenuBarContentComponent
  let fixture: ComponentFixture<DatatableDynamicMenuBarContentComponent>

  beforeEach(waitForAsync(() => {
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
