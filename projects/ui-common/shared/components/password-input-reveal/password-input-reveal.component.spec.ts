import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { TheSeamPasswordInputRevealComponent } from './password-input-reveal.component'

describe('TheSeamPasswordInputRevealComponent', () => {
  let component: TheSeamPasswordInputRevealComponent
  let fixture: ComponentFixture<TheSeamPasswordInputRevealComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [
        TheSeamPasswordInputRevealComponent
    ],
    imports: [
        FontAwesomeModule
    ],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TheSeamPasswordInputRevealComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
