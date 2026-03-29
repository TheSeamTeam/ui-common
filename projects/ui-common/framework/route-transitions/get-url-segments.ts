import { ActivatedRouteSnapshot } from '@angular/router'

export function getUrlSegments(snapshot: ActivatedRouteSnapshot): string[] {
  const segments: string[] = []
  let current: ActivatedRouteSnapshot | null = snapshot

  while (current) {
    for (const seg of current.url) {
      if (seg.path) {
        segments.push(seg.path)
      }
    }
    current = current.firstChild
  }

  return segments
}
