import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { WidgetFooterTextComponent } from './widget-footer-text.component'

describe('WidgetFooterTextComponent', () => {
  let component: WidgetFooterTextComponent
  let fixture: ComponentFixture<WidgetFooterTextComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [WidgetFooterTextComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetFooterTextComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
