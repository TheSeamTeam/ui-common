import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'

import { JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormControlWidget, TheSeamSchemaFormWidgetLayoutNodeOptions } from '@theseam/ui-common/framework'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'

@Component({
  selector: 'seam-schema-form-number',
  templateUrl: './schema-form-number.component.html',
  styleUrls: ['./schema-form-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonSchemaFormModule,
    TheSeamFormFieldModule,
  ],
})
export class TheSeamSchemaFormNumberComponent implements OnInit, TheSeamSchemaFormControlWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue?: any
  controlDisabled = false
  boundControl = false
  options?: TheSeamSchemaFormWidgetLayoutNodeOptions

  @Input() layoutNode: TheSeamSchemaFormControlWidget['layoutNode']
  @Input() layoutIndex: TheSeamSchemaFormControlWidget['layoutIndex']
  @Input() dataIndex: TheSeamSchemaFormControlWidget['dataIndex']

  allowNegative = true
  allowDecimal = true
  allowExponents = false
  lastValidNumber = ''

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode?.options || {} as TheSeamSchemaFormWidgetLayoutNodeOptions
    this.jsf.initializeControl(this)
    if (this.layoutNode?.dataType === 'integer') { this.allowDecimal = false }
  }

  updateValue(event: any) {
    this.jsf.updateValue(this, event.target.value)
  }

}
