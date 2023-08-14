import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { WidgetTileFooterItemComponent } from './widget-tile-footer-item.component'

describe('WidgetTileFooterItemComponent', () => {
  let component: WidgetTileFooterItemComponent
  let fixture: ComponentFixture<WidgetTileFooterItemComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [WidgetTileFooterItemComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetTileFooterItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
