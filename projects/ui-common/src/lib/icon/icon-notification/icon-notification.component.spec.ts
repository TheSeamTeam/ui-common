import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { IconNotificationComponent } from './icon-notification.component'

describe('IconNotificationComponent', () => {
  let component: IconNotificationComponent
  let fixture: ComponentFixture<IconNotificationComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconNotificationComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IconNotificationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
