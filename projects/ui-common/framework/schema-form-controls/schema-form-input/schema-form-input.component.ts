import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'

import { JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormControlWidget, TheSeamSchemaFormWidgetLayoutNodeOptions } from '@theseam/ui-common/framework'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'

@Component({
  selector: 'seam-schema-form-input',
  templateUrl: './schema-form-input.component.html',
  styleUrls: ['./schema-form-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonSchemaFormModule,
    TheSeamFormFieldModule,
  ],
})
export class TheSeamSchemaFormInputComponent implements OnInit, TheSeamSchemaFormControlWidget {

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
  }

  updateValue(event: any) {
    this._jsf.updateValue(this, event.target.value)
  }

}
