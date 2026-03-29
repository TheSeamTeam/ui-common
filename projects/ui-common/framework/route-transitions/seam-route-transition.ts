import { ViewTransitionInfo } from '@angular/router'

import { computeDirection } from './compute-direction'
import { getUrlSegments } from './get-url-segments'

export function seamRouteTransition(): (info: ViewTransitionInfo) => void {
  let isFirst = true

  return (info: ViewTransitionInfo) => {
    // Skip the first navigation (typically a redirect from / to /dashboard).
    // No animation on initial page load.
    if (isFirst) {
      isFirst = false
      return
    }

    const prevSegments = getUrlSegments(info.from)
    const nextSegments = getUrlSegments(info.to)
    const direction = computeDirection(prevSegments, nextSegments)
    document.documentElement.dataset['routeDirection'] = direction
  }
}
