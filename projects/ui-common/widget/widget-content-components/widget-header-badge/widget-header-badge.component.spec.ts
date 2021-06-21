import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { WidgetHeaderBadgeComponent } from './widget-header-badge.component'

describe('WidgetHeaderBadgeComponent', () => {
  let component: WidgetHeaderBadgeComponent
  let fixture: ComponentFixture<WidgetHeaderBadgeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetHeaderBadgeComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetHeaderBadgeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
