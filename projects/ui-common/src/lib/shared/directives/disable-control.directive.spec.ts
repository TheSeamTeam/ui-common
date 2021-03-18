import { Component, DebugElement } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { By } from '@angular/platform-browser'
import { DisableControlDirective } from './disable-control.directive'

@Component({
  template: `<form [formGroup]="testGroup">
    <input type="text" formControlName="testControl" id="testControl" [seamDisableControl]="mode">
  </form>`
})
class TestDisableControlComponent {
  testGroup = new FormGroup({
    testControl: new FormControl([''])
  })
  mode = true
}

describe('DisableControlDirective', () => {

  let component: TestDisableControlComponent
  let fixture: ComponentFixture<TestDisableControlComponent>
  let controlInput: DebugElement

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule
      ],
      declarations: [
        TestDisableControlComponent,
        DisableControlDirective
      ]
    })
    .compileComponents()

  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TestDisableControlComponent)
    component = fixture.componentInstance
    controlInput = fixture.debugElement.query(By.css('input#testControl'))
    fixture.detectChanges()
  })

  it('input should be disabled', () => {
    expect(controlInput.nativeElement.disabled).toBe(true)
  })

})
