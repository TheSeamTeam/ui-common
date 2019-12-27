import { Injectable } from '@angular/core'

import { IDynamicActionLink } from './dynamic-action-link'
import { IDynamicActionLinkDef } from './dynamic-action-link-def'

/**
 * Handles execution of link actions.
 */
@Injectable({
  providedIn: 'root'
})
export class DynamicActionLinkService implements IDynamicActionLink {

  readonly type = 'link'

  label = 'Link Action'

  constructor() { }

  // exec?: (args: IDynamicActionDef<T>, context: D) => Observable<R>

  // execSync?: (args: IDynamicActionDef<T>, context: D) => R
}
