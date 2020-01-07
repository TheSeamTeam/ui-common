import { ChangeDetectionStrategy, Component, Input, Optional } from '@angular/core'

import { TheSeamFormFieldComponent } from './form-field.component'

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

  /** Used if a form control is not found. */
  @Input() required: boolean

  constructor(
    @Optional() public _formField: TheSeamFormFieldComponent
  ) { }

}
