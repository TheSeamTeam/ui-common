import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, Inject, Input, Optional } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'
import { FORM_FIELD_COMPONENT } from './form-field-tokens'

@Component({
  selector: 'seam-form-field-required-indicator',
  template: `
    <ng-container *ngIf="_formField?.contentInput; else noControl">
      <ng-container *ngIf="_formField?.contentInput?.required">*</ng-container>
    </ng-container>
    <ng-template #noControl>
      <ng-container *ngIf="required">*</ng-container>
    </ng-template>
  `,
  styles: [],
  host: {
    'class': 'text-danger'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldRequiredIndicatorComponent {
  static ngAcceptInputType_required: BooleanInput

  /** Used if a form control is not found. */
  @Input() @InputBoolean() required: boolean = false

  constructor(
    @Optional() @Inject(FORM_FIELD_COMPONENT) public readonly _formField: any
  ) { }

}
