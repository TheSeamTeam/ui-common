import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WidgetEmptyLabelComponent } from './widget-empty-label.component'

describe('WidgetEmptyLabelComponent', () => {
  let component: WidgetEmptyLabelComponent
  let fixture: ComponentFixture<WidgetEmptyLabelComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetEmptyLabelComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetEmptyLabelComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
