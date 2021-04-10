import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { AbstractControl } from '@angular/forms'

import { JsonSchemaFormService } from '@ajsf/core'

@Component({
  selector: 'seam-schema-form-input',
  templateUrl: './schema-form-input.component.html',
  styleUrls: ['./schema-form-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamSchemaFormInputComponent implements OnInit {

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
