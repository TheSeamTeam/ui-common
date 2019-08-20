import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WidgetFooterTextComponent } from './widget-footer-text.component'

describe('WidgetFooterTextComponent', () => {
  let component: WidgetFooterTextComponent
  let fixture: ComponentFixture<WidgetFooterTextComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetFooterTextComponent ]
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
