import { ActivatedRoute } from '@angular/router'

export function isEmptyUrlRoute(activatedRoute: ActivatedRoute): boolean {
  return activatedRoute.snapshot.url.length === 0
}
