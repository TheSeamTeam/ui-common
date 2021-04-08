import { MediaObserver } from '@angular/flex-layout'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, startWith, tap } from 'rxjs/operators'

import { MediaQueryAliases } from './breakpoint-aliases'

const mediaQueriesMap: { [breakpoint: string]: string } = {
  'xs'   : 'screen and (max-width: 599px)',
  'sm'   : 'screen and (min-width: 600px) and (max-width: 959px)',
  'md'   : 'screen and (min-width: 960px) and (max-width: 1279px)',
  'lg'   : 'screen and (min-width: 1280px) and (max-width: 1919px)',
  'xl'   : 'screen and (min-width: 1920px) and (max-width: 5000px)',
  'lt-sm': 'screen and (max-width: 599px)',
  'lt-md': 'screen and (max-width: 959px)',
  'lt-lg': 'screen and (max-width: 1279px)',
  'lt-xl': 'screen and (max-width: 1919px)',
  'gt-xs': 'screen and (min-width: 600px)',
  'gt-sm': 'screen and (min-width: 960px)',
  'gt-md': 'screen and (min-width: 1280px)',
  'gt-lg': 'screen and (min-width: 1920px)'
}

/**
 * TODO: Find out if the MediaObserver can return an immediate result on load
 * accurately like the native matchMedia. If not switch to another that can or
 * just implement it myself. I would rather use a well tested library for
 * something like that, since it could have a lot of affect on performance.
 */
function isMediaQueryActive(query: string, fallback: MediaObserver) {
  if (window && window.matchMedia) {
    const x = window.matchMedia(mediaQueriesMap[query])
    return x.matches
  }
  return fallback.isActive(query)
}

/**
 * Observable helper for observing a single breakpoint alias with
 * `@angular/flex-layout` MediaObserver.
 */
export function observeMediaQuery(
  mediaObserver: MediaObserver,
  alias: MediaQueryAliases
): Observable<boolean> {
  // console.log(alias, mediaObserver.isActive(alias), isMediaQueryActive(alias, mediaObserver))
  return mediaObserver.asObservable()
    .pipe(
      map(_ => mediaObserver.isActive(alias)),
      // startWith(mediaObserver.isActive(alias)),
      startWith(isMediaQueryActive(alias, mediaObserver)),
      distinctUntilChanged(),
      shareReplay({ refCount: true, bufferSize: 1 })
    )
}
