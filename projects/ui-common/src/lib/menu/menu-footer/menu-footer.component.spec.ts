import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { MenuFooterComponent } from './menu-footer.component'

describe('MenuFooterComponent', () => {
  let component: MenuFooterComponent
  let fixture: ComponentFixture<MenuFooterComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuFooterComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuFooterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
