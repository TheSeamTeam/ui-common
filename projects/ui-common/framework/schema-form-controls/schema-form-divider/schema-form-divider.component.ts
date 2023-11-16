import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl } from '@angular/forms'

import { JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormWidget } from '@theseam/ui-common/framework'

@Component({
  selector: 'seam-schema-form-divider',
  template: `<hr [class]="options?.htmlClass" />`,
  styles: [`:host { display: block; }`],
  standalone: true,
  imports: [
    CommonModule,
    JsonSchemaFormModule,
  ],
})
export class TheSeamSchemaFormDividerComponent implements OnInit, TheSeamSchemaFormWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue: any
  controlDisabled = false
  boundControl = false
  options: any
  trueValue: any = true
  falseValue: any = false
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

}
