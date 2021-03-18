import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { MenuHeaderComponent } from './menu-header.component'

describe('MenuHeaderComponent', () => {
  let component: MenuHeaderComponent
  let fixture: ComponentFixture<MenuHeaderComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuHeaderComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuHeaderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
