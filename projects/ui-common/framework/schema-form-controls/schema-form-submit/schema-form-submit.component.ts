import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'

import { hasOwn, JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormControlWidget, TheSeamSchemaFormWidgetLayoutNodeOptions } from '../../schema-form'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'

@Component({
  selector: 'seam-schema-form-submit',
  templateUrl: './schema-form-submit.component.html',
  styles: [],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonSchemaFormModule,
    TheSeamFormFieldModule,
  ],
})
export class TheSeamSchemaFormSubmitComponent implements OnInit, TheSeamSchemaFormControlWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue?: any
  controlDisabled = false
  boundControl = false
  options?: TheSeamSchemaFormWidgetLayoutNodeOptions

  @Input() layoutNode: TheSeamSchemaFormControlWidget['layoutNode']
  @Input() layoutIndex: TheSeamSchemaFormControlWidget['layoutIndex']
  @Input() dataIndex: TheSeamSchemaFormControlWidget['dataIndex']

  constructor(
    private readonly _jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode?.options || {} as TheSeamSchemaFormWidgetLayoutNodeOptions
    this._jsf.initializeControl(this)
    if (hasOwn(this.options, 'disabled')) {
      this.controlDisabled = this.options.disabled
    } else if (this._jsf.formOptions.disableInvalidSubmit) {
      this.controlDisabled = !this._jsf.isValid
      this._jsf.isValidChanges.subscribe(isValid => this.controlDisabled = !isValid)
    }
    if (this.controlValue === null || this.controlValue === undefined) {
      this.controlValue = this.options.title
    }
  }

  updateValue(event: any) {
    if (typeof this.options?.onClick === 'function') {
      this.options.onClick(event)
    } else {
      this._jsf.updateValue(this, event.target.value)
    }
  }
}
