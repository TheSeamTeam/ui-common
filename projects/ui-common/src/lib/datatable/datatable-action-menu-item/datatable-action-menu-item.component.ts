import { coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core'

import { ThemeTypes } from '../../models/theme-types'

@Component({
  selector: 'seam-datatable-action-menu-item',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableActionMenuItemComponent {

  @Input() label: string

  // tslint:disable-next-line:no-input-rename
  @Input('attr.href') href: string
  @Input() target: string

  // Allow routerLink inputs on menu item
  @Input() queryParams: {[k: string]: any}
  @Input() fragment: string
  @Input() queryParamsHandling: any
  @Input() preserveFragment: boolean
  @Input() skipLocationChange: boolean
  @Input() replaceUrl: boolean
  @Input() state: {[k: string]: any}
  @Input() routerLink: string | any[]

  @Input() confirmDialog: { message?: string, alert?: string | { message: string, type: ThemeTypes } }

  @Input()
  set disabled(value: boolean) { this._disabled = coerceBooleanProperty(value) }
  get disabled(): boolean { return this._disabled }
  private _disabled: boolean

  @Output() readonly click = new EventEmitter<any>()

}
