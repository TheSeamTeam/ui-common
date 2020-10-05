import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'seam-schema-form-framework',
  templateUrl: './schema-form-framework.component.html',
  styleUrls: ['./schema-form-framework.component.scss']
})
export class TheSeamSchemaFormFrameworkComponent implements OnInit {

  @Input() layoutNode: any
  @Input() layoutIndex: number[]
  @Input() dataIndex: number[]

  constructor() { }

  ngOnInit() {
  }

}
