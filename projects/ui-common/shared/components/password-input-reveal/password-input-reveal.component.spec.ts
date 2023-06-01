import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { PasswordInputRevealComponent } from './password-input-reveal.component'

describe('PasswordInputRevealComponent', () => {
  let component: PasswordInputRevealComponent
  let fixture: ComponentFixture<PasswordInputRevealComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [
        PasswordInputRevealComponent
    ],
    imports: [
        FontAwesomeModule
    ],
    teardown: { destroyAfterEach: false }
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
