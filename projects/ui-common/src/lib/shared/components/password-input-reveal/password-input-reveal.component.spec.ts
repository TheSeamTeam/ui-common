import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { PasswordInputRevealComponent } from './password-input-reveal.component'

describe('PasswordInputRevealComponent', () => {
  let component: PasswordInputRevealComponent
  let fixture: ComponentFixture<PasswordInputRevealComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PasswordInputRevealComponent
      ],
      imports: [
        FontAwesomeModule
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordInputRevealComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
