import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { WidgetTileFooterComponent } from './widget-tile-footer.component'

describe('WidgetTileFooterComponent', () => {
  let component: WidgetTileFooterComponent
  let fixture: ComponentFixture<WidgetTileFooterComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetTileFooterComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetTileFooterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
