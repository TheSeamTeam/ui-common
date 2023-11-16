import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'

import { JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormControlWidget, TheSeamSchemaFormWidgetLayoutNodeOptions } from '@theseam/ui-common/framework'
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
export class TheSeamSchemaFormCheckboxComponent implements OnInit, TheSeamSchemaFormControlWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue?: any
  controlDisabled = false
  boundControl = false
  options?: TheSeamSchemaFormWidgetLayoutNodeOptions

  @Input() layoutNode: TheSeamSchemaFormControlWidget['layoutNode']
  @Input() layoutIndex: TheSeamSchemaFormControlWidget['layoutIndex']
  @Input() dataIndex: TheSeamSchemaFormControlWidget['dataIndex']

  trueValue = true
  falseValue = false

  constructor(
    private readonly _jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode?.options || {} as TheSeamSchemaFormWidgetLayoutNodeOptions
    this._jsf.initializeControl(this)
    if (this.controlValue === null || this.controlValue === undefined) {
      this.controlValue = this.options?.title
    }
  }

  updateValue(event: any) {
    event.preventDefault()
    this._jsf.updateValue(this, event.target.checked ? this.trueValue : this.falseValue)
  }

  get isChecked() {
    return this._jsf.getFormControlValue(this) as any === this.trueValue
  }

}
