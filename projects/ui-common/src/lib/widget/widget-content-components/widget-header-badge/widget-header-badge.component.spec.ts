import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WidgetHeaderBadgeComponent } from './widget-header-badge.component'

describe('WidgetHeaderBadgeComponent', () => {
  let component: WidgetHeaderBadgeComponent
  let fixture: ComponentFixture<WidgetHeaderBadgeComponent>

  beforeEach(async(() => {
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
