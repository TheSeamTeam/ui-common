import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'

import { JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormWidget } from '@theseam/ui-common/framework'
import { TheSeamCheckboxModule } from '@theseam/ui-common/checkbox'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'

@Component({
  selector: 'seam-schema-form-checkbox',
  templateUrl: './schema-form-checkbox.component.html',
  styleUrls: ['./schema-form-checkbox.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonSchemaFormModule,
    TheSeamFormFieldModule,
    TheSeamCheckboxModule,
  ],
})
export class TheSeamSchemaFormCheckboxComponent implements OnInit, TheSeamSchemaFormWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue: any
  controlDisabled = false
  boundControl = false
  options: any
  trueValue: any = true
  falseValue: any = false
  @Input() layoutNode: any
  @Input() layoutIndex: number[] | undefined | null
  @Input() dataIndex: number[] | undefined | null

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

  updateValue(event: any) {
    event.preventDefault()
    this.jsf.updateValue(this, event.target.checked ? this.trueValue : this.falseValue)
  }

  get isChecked() {
    return this.jsf.getFormControlValue(this) === this.trueValue
  }

}
