import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WidgetDescriptionComponent } from './widget-description.component'

describe('WidgetDescriptionComponent', () => {
  let component: WidgetDescriptionComponent
  let fixture: ComponentFixture<WidgetDescriptionComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetDescriptionComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetDescriptionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
