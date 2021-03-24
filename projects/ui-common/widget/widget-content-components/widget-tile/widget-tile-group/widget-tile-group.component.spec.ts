import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { WidgetTileGroupComponent } from './widget-tile-group.component'

describe('WidgetTileGroupComponent', () => {
  let component: WidgetTileGroupComponent
  let fixture: ComponentFixture<WidgetTileGroupComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetTileGroupComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetTileGroupComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
