import { ActivatedRouteSnapshot, UrlSegment } from '@angular/router'
import { seamRouteTransition } from './seam-route-transition'

function makeSnapshot(pathSegments: string[][]): ActivatedRouteSnapshot {
  let root: ActivatedRouteSnapshot | undefined
  let current: ActivatedRouteSnapshot | undefined

  for (const segs of pathSegments) {
    const snapshot = {
      url: segs.map((s) => new UrlSegment(s, {})),
      firstChild: null,
    } as unknown as ActivatedRouteSnapshot

    if (!root) root = snapshot
    if (current) (current as any).firstChild = snapshot
    current = snapshot
  }

  return root!
}

describe('seamRouteTransition', () => {
  let callback: (info: any) => void

  function makeInfo(fromSegments: string[][], toSegments: string[][]) {
    return {
      transition: {} as any,
      from: makeSnapshot(fromSegments),
      to: makeSnapshot(toSegments),
    }
  }

  beforeEach(() => {
    callback = seamRouteTransition()
    delete document.documentElement.dataset['routeDirection']
  })

  afterEach(() => {
    delete document.documentElement.dataset['routeDirection']
  })

  it('skips the first navigation (no animation on initial load)', () => {
    callback(makeInfo([[''], ['']], [[''], ['dashboard']]))

    expect(document.documentElement.dataset['routeDirection']).toBeUndefined()
  })

  it('animates the second navigation onward', () => {
    callback(makeInfo([[''], ['']], [[''], ['dashboard']]))
    callback(makeInfo([[''], ['dashboard']], [[''], ['claims']]))

    expect(document.documentElement.dataset['routeDirection']).toBe('sibling')
  })

  it('sets data-route-direction to "sibling" for same-depth navigation', () => {
    callback(makeInfo([[''], ['']], [[''], ['dashboard']])) // skip first
    callback(makeInfo([[''], ['claims']], [[''], ['purchase-orders']]))

    expect(document.documentElement.dataset['routeDirection']).toBe('sibling')
  })

  it('sets data-route-direction to "deeper" when navigating deeper', () => {
    callback(makeInfo([[''], ['']], [[''], ['dashboard']])) // skip first
    callback(makeInfo([[''], ['claims']], [[''], ['claims'], ['123']]))

    expect(document.documentElement.dataset['routeDirection']).toBe('deeper')
  })

  it('sets data-route-direction to "shallower" when navigating shallower', () => {
    callback(makeInfo([[''], ['']], [[''], ['dashboard']])) // skip first
    callback(makeInfo([[''], ['claims'], ['123']], [[''], ['claims']]))

    expect(document.documentElement.dataset['routeDirection']).toBe('shallower')
  })

  it('handles cross-branch navigation as sibling', () => {
    callback(makeInfo([[''], ['']], [[''], ['dashboard']])) // skip first
    callback(
      makeInfo(
        [[''], ['claims'], ['123'], ['edit']],
        [[''], ['purchase-orders'], ['456']],
      ),
    )

    expect(document.documentElement.dataset['routeDirection']).toBe('sibling')
  })
})
