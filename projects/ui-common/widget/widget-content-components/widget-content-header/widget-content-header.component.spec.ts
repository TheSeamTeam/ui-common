import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { WidgetContentHeaderComponent } from './widget-content-header.component'

describe('WidgetContentHeaderComponent', () => {
  let component: WidgetContentHeaderComponent
  let fixture: ComponentFixture<WidgetContentHeaderComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [WidgetContentHeaderComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetContentHeaderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
