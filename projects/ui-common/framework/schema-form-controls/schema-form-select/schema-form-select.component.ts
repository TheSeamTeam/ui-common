import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'

import { buildTitleMap, isArray, JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormControlWidget, TheSeamSchemaFormWidgetLayoutNodeOptions } from '../../schema-form'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { NgSelectModule } from '@ng-select/ng-select'

@Component({
  selector: 'seam-schema-form-select',
  templateUrl: './schema-form-select.component.html',
  styleUrls: ['./schema-form-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonSchemaFormModule,
    TheSeamFormFieldModule,
    NgSelectModule,
  ],
})
export class TheSeamSchemaFormSelectComponent implements OnInit, TheSeamSchemaFormControlWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue?: any
  controlDisabled = false
  boundControl = false
  options?: TheSeamSchemaFormWidgetLayoutNodeOptions

  @Input() layoutNode: TheSeamSchemaFormControlWidget['layoutNode']
  @Input() layoutIndex: TheSeamSchemaFormControlWidget['layoutIndex']
  @Input() dataIndex: TheSeamSchemaFormControlWidget['dataIndex']

  selectList: any[] = []
  isArray = isArray

  constructor(
    private readonly _jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode?.options || {} as TheSeamSchemaFormWidgetLayoutNodeOptions
    this.selectList = buildTitleMap(
      this.options.titleMap || this.options.enumNames,
      this.options.enum, !!this.options.required, !!this.options.flatList
    )

    this._jsf.initializeControl(this)
  }

  updateValue(event: any) {
    this._jsf.updateValue(this, event.value)
  }

}
