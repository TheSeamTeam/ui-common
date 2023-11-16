import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { AbstractControl } from '@angular/forms'

import { JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormWidget } from '@theseam/ui-common/framework'

@Component({
  selector: 'seam-schema-form-number',
  templateUrl: './schema-form-number.component.html',
  styleUrls: ['./schema-form-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamSchemaFormNumberComponent implements OnInit, TheSeamSchemaFormWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue: any
  controlDisabled = false
  boundControl = false
  options: any
  allowNegative = true
  allowDecimal = true
  allowExponents = false
  lastValidNumber = ''
  @Input() layoutNode: any
  @Input() layoutIndex: number[] | undefined | null
  @Input() dataIndex: number[] | undefined | null

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {}
    this.jsf.initializeControl(this)
    if (this.layoutNode.dataType === 'integer') { this.allowDecimal = false }
  }

  updateValue(event: any) {
    this.jsf.updateValue(this, event.target.value)
  }

}
