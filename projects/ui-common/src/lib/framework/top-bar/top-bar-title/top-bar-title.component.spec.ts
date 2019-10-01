import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TopBarTitleComponent } from './top-bar-title.component'

describe('TopBarTitleComponent', () => {
  let component: TopBarTitleComponent
  let fixture: ComponentFixture<TopBarTitleComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopBarTitleComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TopBarTitleComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
