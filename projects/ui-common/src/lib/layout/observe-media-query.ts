import { MediaObserver } from '@angular/flex-layout'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, startWith, tap } from 'rxjs/operators'

import { MediaQueryAliases } from './breakpoint-aliases'

/**
 * Observable helper for observing a single breakpoint alias with
 * `@angular/flex-layout` MediaObserver.
 */
export function observeMediaQuery(
  mediaObserver: MediaObserver,
  alias: MediaQueryAliases
): Observable<boolean> {
  return mediaObserver.asObservable()
    .pipe(
      map(_ => mediaObserver.isActive(alias)),
      startWith(mediaObserver.isActive(alias)),
      distinctUntilChanged(),
      shareReplay(1)
    )
}
