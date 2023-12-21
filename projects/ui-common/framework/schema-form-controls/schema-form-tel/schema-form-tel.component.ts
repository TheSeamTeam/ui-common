import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'

import { JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormControlWidget, TheSeamSchemaFormWidgetLayoutNodeOptions } from '../../schema-form'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamTelInputModule } from '@theseam/ui-common/tel-input'

@Component({
  selector: 'seam-schema-form-tel',
  templateUrl: './schema-form-tel.component.html',
  // styleUrls: ['./schema-form-tel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonSchemaFormModule,
    TheSeamFormFieldModule,
    TheSeamTelInputModule,
  ],
})
export class TheSeamSchemaFormTelComponent implements OnInit, TheSeamSchemaFormControlWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue?: any
  controlDisabled = false
  boundControl = false
  options?: TheSeamSchemaFormWidgetLayoutNodeOptions

  @Input() layoutNode: TheSeamSchemaFormControlWidget['layoutNode']
  @Input() layoutIndex: TheSeamSchemaFormControlWidget['layoutIndex']
  @Input() dataIndex: TheSeamSchemaFormControlWidget['dataIndex']

  autoCompleteList: string[] = []

  constructor(
    private readonly _jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode?.options || {} as TheSeamSchemaFormWidgetLayoutNodeOptions
    this._jsf.initializeControl(this)
    console.log(this.controlValue)
    console.log(this.formControl?.value)
  }

  updateValue(event: any) {
    this._jsf.updateValue(this, event.target.value)
  }

}
