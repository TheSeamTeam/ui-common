import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { WidgetDescriptionComponent } from './widget-description.component'

describe('WidgetDescriptionComponent', () => {
  let component: WidgetDescriptionComponent
  let fixture: ComponentFixture<WidgetDescriptionComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [WidgetDescriptionComponent],
    teardown: { destroyAfterEach: false }
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
