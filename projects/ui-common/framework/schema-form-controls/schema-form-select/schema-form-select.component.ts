import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { AbstractControl } from '@angular/forms'

import { buildTitleMap, isArray, JsonSchemaFormService } from '@ajsf/core'

@Component({
  selector: 'seam-schema-form-select',
  templateUrl: './schema-form-select.component.html',
  styleUrls: ['./schema-form-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamSchemaFormSelectComponent implements OnInit {

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
