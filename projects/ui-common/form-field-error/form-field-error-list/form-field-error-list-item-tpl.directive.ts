import { BooleanInput } from '@angular/cdk/coercion'
import { Directive, Input, TemplateRef } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'

@Directive({
  selector: '[seamFormFieldErrorListItemTpl]'
})
export class FormFieldErrorListItemTplDirective {
  static ngAcceptInputType_external: BooleanInput

  @Input() validatorName: string | undefined | null

  @Input() @InputBoolean() external = false

  constructor(public template: TemplateRef<any>) {}

}
