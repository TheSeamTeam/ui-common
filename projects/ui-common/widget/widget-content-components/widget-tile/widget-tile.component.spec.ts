import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { WidgetTileSecondaryIconDirective } from './widget-tile-secondary-icon.directive'
import { WidgetTileComponent } from './widget-tile.component'

describe('WidgetTileComponent', () => {
  let component: WidgetTileComponent
  let fixture: ComponentFixture<WidgetTileComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        WidgetTileComponent,
        WidgetTileSecondaryIconDirective
      ],
      imports: [
        TheSeamIconModule
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetTileComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
