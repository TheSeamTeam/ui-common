import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TheSeamIconModule } from '../../../icon/index'

import { WidgetTileSecondaryIconDirective } from './widget-tile-secondary-icon.directive'
import { WidgetTileComponent } from './widget-tile.component'

describe('WidgetTileComponent', () => {
  let component: WidgetTileComponent
  let fixture: ComponentFixture<WidgetTileComponent>

  beforeEach(async(() => {
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
