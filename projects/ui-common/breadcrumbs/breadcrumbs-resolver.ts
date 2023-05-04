import { Resolve } from '@angular/router'

export interface TheSeamBreadcrumbsResolver extends Resolve<string> { }

//
// NOTE: The following types are only for backward compatability.
//

/** @deprecated Use `TheSeamBreadcrumbsResolver` instead. */
export type ITheSeamBreadcrumbsResolver = TheSeamBreadcrumbsResolver
