import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WidgetFooterLinkComponent } from './widget-footer-link.component'

describe('WidgetFooterLinkComponent', () => {
  let component: WidgetFooterLinkComponent
  let fixture: ComponentFixture<WidgetFooterLinkComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetFooterLinkComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetFooterLinkComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
