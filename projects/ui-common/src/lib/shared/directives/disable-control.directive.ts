import { Directive, Input } from '@angular/core'
import { NgControl } from '@angular/forms'

// Source: https://netbasal.com/disabling-form-controls-when-working-with-reactive-forms-in-angular-549dd7b42110

@Directive({
  selector: '[seamDisableControl]'
})
export class DisableControlDirective {

  @Input() set seamDisableControl(condition: boolean) {
    const action = condition ? 'disable' : 'enable'
    const control = this.ngControl.control
    if (control) {
      control[action]()
    }
  }

  constructor(private ngControl: NgControl) { }

}
