import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { MenuFooterActionComponent } from './menu-footer-action.component'

describe('MenuFooterActionComponent', () => {
  let component: MenuFooterActionComponent
  let fixture: ComponentFixture<MenuFooterActionComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuFooterActionComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuFooterActionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
