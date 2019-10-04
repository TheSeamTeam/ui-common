import { ActivatedRoute } from '@angular/router'

export interface ITheSeamBreadcrumb {
  /** Value to display on breadcrumb. */
  value: string
  /** Path to the crumb. */
  path: string
  /** Route the crumb is from. */
  route: ActivatedRoute
}
