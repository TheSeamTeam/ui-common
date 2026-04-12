import { Observable } from 'rxjs'
import { distinctUntilChanged, shareReplay } from 'rxjs/operators'

import { MediaQueryAliases } from './breakpoint-aliases'

const mediaQueriesMap: { [breakpoint: string]: string } = {
  xs: 'screen and (max-width: 599px)',
  sm: 'screen and (min-width: 600px) and (max-width: 959px)',
  md: 'screen and (min-width: 960px) and (max-width: 1279px)',
  lg: 'screen and (min-width: 1280px) and (max-width: 1919px)',
  xl: 'screen and (min-width: 1920px) and (max-width: 5000px)',
  'lt-sm': 'screen and (max-width: 599px)',
  'lt-md': 'screen and (max-width: 959px)',
  'lt-lg': 'screen and (max-width: 1279px)',
  'lt-xl': 'screen and (max-width: 1919px)',
  'gt-xs': 'screen and (min-width: 600px)',
  'gt-sm': 'screen and (min-width: 960px)',
  'gt-md': 'screen and (min-width: 1280px)',
  'gt-lg': 'screen and (min-width: 1920px)',
}

/**
 * Observable helper for observing a single breakpoint alias using native
 * `window.matchMedia`.
 */
export function observeMediaQuery(
  alias: MediaQueryAliases,
): Observable<boolean> {
  const query = mediaQueriesMap[alias]

  return new Observable<boolean>((subscriber) => {
    const mql = window.matchMedia(query)
    subscriber.next(mql.matches)

    const handler = (event: MediaQueryListEvent) => {
      subscriber.next(event.matches)
    }

    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }).pipe(
    distinctUntilChanged(),
    shareReplay({ refCount: true, bufferSize: 1 }),
  )
}
