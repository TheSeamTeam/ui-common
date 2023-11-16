import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'

import { hasOwn, JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormWidget } from '@theseam/ui-common/framework'
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
export class TheSeamSchemaFormSubmitComponent implements OnInit, TheSeamSchemaFormWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue: any
  controlDisabled = false
  boundControl = false
  options: any

  @Input() layoutNode: any
  @Input() layoutIndex: number[] | undefined | null
  @Input() dataIndex: number[] | undefined | null

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {}
    this.jsf.initializeControl(this)
    if (hasOwn(this.options, 'disabled')) {
      this.controlDisabled = this.options.disabled
    } else if (this.jsf.formOptions.disableInvalidSubmit) {
      this.controlDisabled = !this.jsf.isValid
      this.jsf.isValidChanges.subscribe(isValid => this.controlDisabled = !isValid)
    }
    if (this.controlValue === null || this.controlValue === undefined) {
      this.controlValue = this.options.title
    }
  }

  updateValue(event: any) {
    if (typeof this.options.onClick === 'function') {
      this.options.onClick(event)
    } else {
      this.jsf.updateValue(this, event.target.value)
    }
  }
}
