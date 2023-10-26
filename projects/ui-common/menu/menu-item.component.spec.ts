import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { MenuItemComponent } from './menu-item.component'

describe('MenuItemComponent', () => {
  let component: MenuItemComponent
  let fixture: ComponentFixture<MenuItemComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MenuItemComponent],
      imports: [
          TheSeamIconModule
      ],
      teardown: { destroyAfterEach: false }
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
