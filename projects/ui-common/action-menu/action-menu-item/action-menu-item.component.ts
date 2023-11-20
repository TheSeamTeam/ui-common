import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core'

import { ThemeTypes } from '@theseam/ui-common/models'

import { ActionMenuComponent } from '../action-menu/action-menu.component'

@Component({
  selector: 'seam-action-menu-item',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionMenuItemComponent {

  @Input() label: string | undefined | null

  @Input() href: string | undefined | null
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

  @Input() subMenu: ActionMenuComponent | undefined | null

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() readonly click = new EventEmitter<any>()

}
