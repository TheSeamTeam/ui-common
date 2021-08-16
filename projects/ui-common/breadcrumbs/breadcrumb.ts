import { ActivatedRoute } from '@angular/router'

export interface TheSeamBreadcrumb {
  /** Value to display on breadcrumb. */
  value: string
  /** Path to the crumb. */
  path: string
  /** Route the crumb is from. */
  route: ActivatedRoute
}



//
// NOTE: The following types are only for backward compatability.
//

/** @deprecated Use `TheSeamBreadcrumb` instead. */
export type ITheSeamBreadcrumb = TheSeamBreadcrumb
