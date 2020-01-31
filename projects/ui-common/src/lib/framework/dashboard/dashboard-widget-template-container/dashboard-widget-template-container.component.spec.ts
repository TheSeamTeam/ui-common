import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DashboardWidgetTemplateContainerComponent } from './dashboard-widget-template-container.component'

describe('DashboardWidgetTemplateContainerComponent', () => {
  let component: DashboardWidgetTemplateContainerComponent
  let fixture: ComponentFixture<DashboardWidgetTemplateContainerComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWidgetTemplateContainerComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWidgetTemplateContainerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
