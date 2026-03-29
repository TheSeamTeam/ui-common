import { ActivatedRouteSnapshot, UrlSegment } from '@angular/router'
import { getUrlSegments } from './get-url-segments'

function makeSnapshot(
  segments: string[][],
  parent?: ActivatedRouteSnapshot,
): ActivatedRouteSnapshot {
  let root: ActivatedRouteSnapshot | undefined
  let current: ActivatedRouteSnapshot | undefined

  for (const segs of segments) {
    const snapshot = {
      url: segs.map((s) => new UrlSegment(s, {})),
      firstChild: null,
    } as unknown as ActivatedRouteSnapshot

    if (!root) {
      root = snapshot
    }
    if (current) {
      ;(current as any).firstChild = snapshot
    }
    current = snapshot
  }

  return root!
}

describe('getUrlSegments', () => {
  it('extracts segments from a single-level route', () => {
    const snapshot = makeSnapshot([['claims']])
    expect(getUrlSegments(snapshot)).toEqual(['claims'])
  })

  it('extracts segments from a nested route', () => {
    const snapshot = makeSnapshot([[''], ['claims'], ['123']])
    expect(getUrlSegments(snapshot)).toEqual(['claims', '123'])
  })

  it('extracts segments from a deeply nested route', () => {
    const snapshot = makeSnapshot([[''], ['claims'], ['123'], ['edit']])
    expect(getUrlSegments(snapshot)).toEqual(['claims', '123', 'edit'])
  })

  it('handles empty root segment', () => {
    const snapshot = makeSnapshot([['']])
    expect(getUrlSegments(snapshot)).toEqual([])
  })

  it('handles multiple segments at one level', () => {
    const snapshot = makeSnapshot([['section', 'claims'], ['123']])
    expect(getUrlSegments(snapshot)).toEqual(['section', 'claims', '123'])
  })
})
