import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core'
// import { QueryParamsHandling } from '@angular/router/src/config'

@Component({
  selector: 'seam-datatable-action-menu-item',
  templateUrl: './datatable-action-menu-item.component.html',
  styleUrls: ['./datatable-action-menu-item.component.scss']
})
export class DatatableActionMenuItemComponent implements OnInit {

  @HostBinding('class.list-group-item') _listGroupItem = true
  @HostBinding('class.list-group-item-action') _listGroupItemAction = true

  @Input() label: string

  // tslint:disable-next-line:no-input-rename
  @Input('attr.href') href: string
  @Input() target: string

  // Allow routerLink inputs on menu item
  @Input() queryParams: {[k: string]: any}
  @Input() fragment: string
  // @Input() queryParamsHandling: QueryParamsHandling
  @Input() queryParamsHandling: any
  @Input() preserveFragment: boolean
  @Input() skipLocationChange: boolean
  @Input() replaceUrl: boolean
  @Input() state: {[k: string]: any}
  @Input() routerLink: string | any[]

  @Output() click = new EventEmitter<any>()

  constructor() { }

  ngOnInit() {
  }

}
