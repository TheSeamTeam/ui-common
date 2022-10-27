import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DashboardWidgetTemplateContainerComponent } from './dashboard-widget-template-container.component'

describe('DashboardWidgetTemplateContainerComponent', () => {
  let component: DashboardWidgetTemplateContainerComponent
  let fixture: ComponentFixture<DashboardWidgetTemplateContainerComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DashboardWidgetTemplateContainerComponent],
    teardown: { destroyAfterEach: false }
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
