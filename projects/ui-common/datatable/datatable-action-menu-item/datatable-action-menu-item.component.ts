import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core'

import { ThemeTypes } from '@theseam/ui-common/models'

import { DatatableActionMenuComponent } from '../datatable-action-menu/datatable-action-menu.component'

@Component({
  selector: 'seam-datatable-action-menu-item',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableActionMenuItemComponent {

  @Input() label: string | undefined | null

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('attr.href') href: string | undefined | null
  @Input() target: string | undefined | null

  // Allow routerLink inputs on menu item
  @Input() queryParams: {[k: string]: any} | undefined | null
  @Input() fragment: string | undefined | null
  @Input() queryParamsHandling: any
  @Input() preserveFragment: boolean| undefined | null
  @Input() skipLocationChange: boolean| undefined | null
  @Input() replaceUrl: boolean| undefined | null
  @Input() state: {[k: string]: any} | undefined | null
  @Input() routerLink: string | any[] | undefined | null

  @Input() confirmDialog: { message?: string, alert?: string | { message: string, type: ThemeTypes } } | undefined | null

  @Input() disabled: boolean | undefined | null

  @Input() subMenu: DatatableActionMenuComponent | undefined | null

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() readonly click = new EventEmitter<any>()

}
