import { Observable } from 'rxjs'

import { ITheSeamBaseLayoutNav } from './base-layout-nav'

export interface ITheSeamBaseLayoutRef {

  readonly registeredNav: ITheSeamBaseLayoutNav | undefined

  registeredNav$: Observable<ITheSeamBaseLayoutNav | undefined>

  registerNav(nav: ITheSeamBaseLayoutNav): void

  unregisterNav(nav: ITheSeamBaseLayoutNav): void

}
