import { Component, Input, OnInit } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'

@Component({
  selector: 'seam-form-field-error',
  templateUrl: './form-field-error.component.html',
  styleUrls: ['./form-field-error.component.scss']
})
export class FormFieldErrorComponent implements OnInit {

  @Input() validatorName: string | undefined | null
  @Input() message: string | undefined | null

  @Input() @InputBoolean() showValidatorName: boolean = false

  constructor() { }

  ngOnInit() {
  }

}
