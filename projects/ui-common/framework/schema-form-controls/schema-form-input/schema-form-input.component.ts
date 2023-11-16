import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'

import { JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormWidget } from '@theseam/ui-common/framework'
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
export class TheSeamSchemaFormInputComponent implements OnInit, TheSeamSchemaFormWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue?: string
  controlDisabled = false
  boundControl = false
  options: any
  autoCompleteList: string[] = []
  @Input() layoutNode: any
  @Input() layoutIndex: number[] | undefined | null
  @Input() dataIndex: number[] | undefined | null

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {}
    this.jsf.initializeControl(this)
  }

  updateValue(event: any) {
    this.jsf.updateValue(this, event.target.value)
  }

}
