import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { WidgetTileListComponent } from './widget-tile-list.component'

describe('WidgetTileListComponent', () => {
  let component: WidgetTileListComponent
  let fixture: ComponentFixture<WidgetTileListComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [WidgetTileListComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetTileListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
