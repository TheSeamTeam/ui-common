import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { AbstractControl } from '@angular/forms'

import { buildTitleMap, getControl, isArray, JsonSchemaFormService } from '@ajsf/core'

@Component({
  selector: 'seam-schema-form-select',
  templateUrl: './schema-form-select.component.html',
  styleUrls: ['./schema-form-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamSchemaFormSelectComponent implements OnInit {

  formControl: AbstractControl
  controlName: string
  controlValue: any
  controlDisabled = false
  boundControl = false
  options: any
  selectList: any[] = []
  isArray = isArray
  @Input() layoutNode: any
  @Input() layoutIndex: number[]
  @Input() dataIndex: number[]

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {}
    this.selectList = buildTitleMap(
      this.options.titleMap || this.options.enumNames,
      this.options.enum, !!this.options.required, !!this.options.flatList
    )
    // console.log('options', this.options)
    // console.log('selectList', this.selectList)

    this.jsf.initializeControl(this)
  }

  updateValue(event) {
    this.jsf.updateValue(this, event.value)
  }

}
