import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { WidgetFooterLinkComponent } from './widget-footer-link.component'

describe('WidgetFooterLinkComponent', () => {
  let component: WidgetFooterLinkComponent
  let fixture: ComponentFixture<WidgetFooterLinkComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [WidgetFooterLinkComponent],
    teardown: { destroyAfterEach: false }
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
