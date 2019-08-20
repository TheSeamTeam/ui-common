import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WidgetContentHeaderComponent } from './widget-content-header.component'

describe('WidgetContentHeaderComponent', () => {
  let component: WidgetContentHeaderComponent
  let fixture: ComponentFixture<WidgetContentHeaderComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetContentHeaderComponent ]
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
