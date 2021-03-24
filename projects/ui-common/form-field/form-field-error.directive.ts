import { Directive, Input, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamFormFieldError]'
})
export class FormFieldErrorDirective {

  @Input()
  get validatorName(): string { return this._validatorName || this.seamFormFieldError }
  set validatorName(value: string) { this._validatorName = value }
  private _validatorName: string

  @Input() seamFormFieldError: string

  @Input() external = false

  constructor(public template: TemplateRef<any>) {}

}
