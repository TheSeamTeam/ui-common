import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { MenuComponent } from './menu.component'

describe('MenuComponent', () => {
  let component: MenuComponent
  let fixture: ComponentFixture<MenuComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [MenuComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
