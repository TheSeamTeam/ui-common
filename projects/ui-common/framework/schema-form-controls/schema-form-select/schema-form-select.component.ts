import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'

import { buildTitleMap, isArray, JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormWidget } from '@theseam/ui-common/framework'
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
export class TheSeamSchemaFormSelectComponent implements OnInit, TheSeamSchemaFormWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue: any
  controlDisabled = false
  boundControl = false
  options: any
  selectList: any[] = []
  isArray = isArray
  @Input() layoutNode: any
  @Input() layoutIndex: number[] | undefined | null
  @Input() dataIndex: number[] | undefined | null

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {}
    this.selectList = buildTitleMap(
      this.options.titleMap || this.options.enumNames,
      this.options.enum, !!this.options.required, !!this.options.flatList
    )

    this.jsf.initializeControl(this)
  }

  updateValue(event: any) {
    this.jsf.updateValue(this, event.value)
  }

}
