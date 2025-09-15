import { Observable } from 'rxjs'

import { TheSeamBaseLayoutAction } from './base-layout-action'
import { TheSeamBaseLayoutNav } from './base-layout-nav'

export interface TheSeamBaseLayoutRef {

  readonly registeredNav: TheSeamBaseLayoutNav | undefined
  readonly registeredActions: TheSeamBaseLayoutAction[]

  readonly registeredNav$: Observable<TheSeamBaseLayoutNav | undefined>
  readonly registeredActions$: Observable<TheSeamBaseLayoutAction[]>

  registerNav(nav: TheSeamBaseLayoutNav): void

  unregisterNav(nav: TheSeamBaseLayoutNav): void

  registerAction(action: TheSeamBaseLayoutAction): void

  unregisterAction(action: TheSeamBaseLayoutAction | string): void

  isActionRegistered(actionName: string): boolean

}
