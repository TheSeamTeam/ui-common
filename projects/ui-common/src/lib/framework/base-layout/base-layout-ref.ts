import { Observable } from 'rxjs'

import { BaseLayoutAction } from './base-layout-action'
import { ITheSeamBaseLayoutNav } from './base-layout-nav'

export interface ITheSeamBaseLayoutRef {

  readonly registeredNav: ITheSeamBaseLayoutNav | undefined
  readonly registeredActions: BaseLayoutAction[]

  readonly registeredNav$: Observable<ITheSeamBaseLayoutNav | undefined>
  readonly registeredActions$: Observable<BaseLayoutAction[]>

  registerNav(nav: ITheSeamBaseLayoutNav): void

  unregisterNav(nav: ITheSeamBaseLayoutNav): void

  registerAction(action: BaseLayoutAction): void

  unregisterAction(action: BaseLayoutAction | string): void

  isActionRegistered(actionName: string): boolean

}
