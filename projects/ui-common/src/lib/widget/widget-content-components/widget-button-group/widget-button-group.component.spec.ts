import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { WidgetButtonGroupComponent } from './widget-button-group.component'

describe('WidgetButtonGroupComponent', () => {
  let component: WidgetButtonGroupComponent
  let fixture: ComponentFixture<WidgetButtonGroupComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetButtonGroupComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetButtonGroupComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
