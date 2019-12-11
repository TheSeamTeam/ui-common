import { Injectable } from '@angular/core'

import { IDynamicActionLink } from './dynamic-action-link'
import { IDynamicActionLinkArgs } from './dynamic-action-link-args'

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
}
