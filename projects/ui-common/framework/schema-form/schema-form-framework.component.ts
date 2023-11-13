import { Component, Input } from '@angular/core'

@Component({
  selector: 'seam-schema-form-framework',
  templateUrl: './schema-form-framework.component.html',
  styleUrls: ['./schema-form-framework.component.scss'],
  host: {
    '[attr.data-name]': 'layoutNode?.node',
    '[attr.data-data-pointer]': 'layoutNode?.dataPointer',
  },
})
export class TheSeamSchemaFormFrameworkComponent {

  @Input() layoutNode: any
  @Input() layoutIndex: number[] | undefined | null
  @Input() dataIndex: number[] | undefined | null

}
