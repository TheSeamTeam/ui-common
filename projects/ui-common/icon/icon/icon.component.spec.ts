import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { IconComponent } from './icon.component'

describe('IconComponent', () => {
  let component: IconComponent
  let fixture: ComponentFixture<IconComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [IconComponent],
    imports: [
        FontAwesomeModule
    ],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IconComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
