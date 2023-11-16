import { Component, Input, OnInit } from '@angular/core'

import { TheSeamSchemaFormWidget } from '@theseam/ui-common/framework'

@Component({
  selector: 'seam-schema-form-divider',
  template: `<hr [class]="options?.htmlClass" />`,
  styles: [`:host { display: block; }`],
  standalone: true,
})
export class TheSeamSchemaFormDividerComponent implements OnInit, TheSeamSchemaFormWidget {

  options: any
  @Input() layoutNode: any
  @Input() layoutIndex: number[] | undefined | null
  @Input() dataIndex: number[] | undefined | null

  ngOnInit() {
    this.options = this.layoutNode.options || {}
  }

}
