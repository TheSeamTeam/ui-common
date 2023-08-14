import { BooleanInput } from '@angular/cdk/coercion'
import { Directive, Input, TemplateRef } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamFormFieldError]'
})
export class FormFieldErrorDirective {
  static ngAcceptInputType_external: BooleanInput

  @Input()
  get validatorName(): string | undefined | null { return this._validatorName || this.seamFormFieldError }
  set validatorName(value: string | undefined | null) { this._validatorName = value }
  private _validatorName: string | undefined | null

  @Input() seamFormFieldError: string | undefined | null

  @Input() @InputBoolean() external = false

  constructor(public template: TemplateRef<any>) {}

}
