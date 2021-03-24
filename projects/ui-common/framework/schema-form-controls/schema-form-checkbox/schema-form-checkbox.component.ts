import { Component, Input, OnInit } from '@angular/core'
import { AbstractControl } from '@angular/forms'

import { JsonSchemaFormService } from '@ajsf/core'

@Component({
  selector: 'seam-schema-form-checkbox',
  templateUrl: './schema-form-checkbox.component.html',
  styleUrls: ['./schema-form-checkbox.component.scss']
})
export class TheSeamSchemaFormCheckboxComponent implements OnInit {

  formControl: AbstractControl
  controlName: string
  controlValue: any
  controlDisabled = false
  boundControl = false
  options: any
  trueValue: any = true
  falseValue: any = false
  @Input() layoutNode: any
  @Input() layoutIndex: number[]
  @Input() dataIndex: number[]

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {}
    this.jsf.initializeControl(this)
    if (this.controlValue === null || this.controlValue === undefined) {
      this.controlValue = this.options.title
    }
  }

  updateValue(event) {
    event.preventDefault()
    this.jsf.updateValue(this, event.target.checked ? this.trueValue : this.falseValue)
  }

  get isChecked() {
    return this.jsf.getFormControlValue(this) === this.trueValue
  }

}
