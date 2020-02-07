import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WidgetTileFooterComponent } from './widget-tile-footer.component'

describe('WidgetTileFooterComponent', () => {
  let component: WidgetTileFooterComponent
  let fixture: ComponentFixture<WidgetTileFooterComponent>

  beforeEach(async(() => {
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
