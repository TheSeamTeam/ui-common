import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'seam-form-field-error',
  templateUrl: './form-field-error.component.html',
  styleUrls: ['./form-field-error.component.scss']
})
export class FormFieldErrorComponent implements OnInit {

  @Input() validatorName: string
  @Input() message: string | undefined | null

  @Input() showValidatorName = false

  constructor() { }

  ngOnInit() {
  }

}
