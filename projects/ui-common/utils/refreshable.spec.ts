import { fakeAsync, tick } from '@angular/core/testing'
import { Subject, of, throwError } from 'rxjs'

import { Refreshable } from './refreshable'

describe('Refreshable', () => {
  it('does not call action() until data$ has a subscriber', () => {
    const action = jest.fn(() => of(1))
    const r = new Refreshable<number>({ action })
    expect(action).not.toHaveBeenCalled()
  })

  it('calls action() on first data$ subscribe and emits the value', fakeAsync(() => {
    const action = jest.fn(() => of(42))
    const r = new Refreshable<number>({ action })

    let received: number | undefined
    r.data$.subscribe((v) => (received = v))
    tick(0)

    expect(action).toHaveBeenCalledTimes(1)
    expect(received).toBe(42)
  }))

  it('loading$ defaults to false and does not flip when subscribed alone', fakeAsync(() => {
    const action = jest.fn(() => of(1))
    const r = new Refreshable<number>({ action })

    const seen: boolean[] = []
    r.loading$.subscribe((v) => seen.push(v))
    tick(100)

    expect(action).not.toHaveBeenCalled()
    expect(seen).toEqual([false])
  }))

  it('initialized$ defaults to false and does not flip when subscribed alone', fakeAsync(() => {
    const action = jest.fn(() => of(1))
    const r = new Refreshable<number>({ action })

    const seen: boolean[] = []
    r.initialized$.subscribe((v) => seen.push(v))
    tick(100)

    expect(action).not.toHaveBeenCalled()
    expect(seen).toEqual([false])
  }))

  it('loading$ flips true while action is in flight, then false on emission', fakeAsync(() => {
    const inner$ = new Subject<number>()
    const r = new Refreshable<number>({ action: () => inner$ })

    const loading: boolean[] = []
    r.loading$.subscribe((v) => loading.push(v))
    r.data$.subscribe()
    tick(0)

    expect(loading).toEqual([false, true])

    inner$.next(7)
    tick(0)

    expect(loading).toEqual([false, true, false])
  }))

  it('initialized$ becomes true on first emission and stays true', fakeAsync(() => {
    const inner$ = new Subject<number>()
    const r = new Refreshable<number>({ action: () => inner$ })

    const init: boolean[] = []
    r.initialized$.subscribe((v) => init.push(v))
    r.data$.subscribe()
    tick(0)

    expect(init).toEqual([false])

    inner$.next(7)
    tick(0)

    expect(init).toEqual([false, true])
  }))

  it('refresh() runs action() again and emits the new value', fakeAsync(() => {
    let counter = 0
    const r = new Refreshable<number>({ action: () => of(++counter) })

    const seen: number[] = []
    r.data$.subscribe((v) => seen.push(v))
    tick(0)

    expect(seen).toEqual([1])

    r.refresh()
    tick(0)

    expect(seen).toEqual([1, 2])
  }))

  it('poll$ tick triggers action() and emits the new value without clearing cache', fakeAsync(() => {
    let counter = 0
    const poll$ = new Subject<void>()
    const r = new Refreshable<number>({
      action: () => of(++counter),
      poll$,
    })

    const data: number[] = []
    const init: boolean[] = []
    r.initialized$.subscribe((v) => init.push(v))
    r.data$.subscribe((v) => data.push(v))
    tick(0)

    expect(data).toEqual([1])
    expect(init).toEqual([false, true])

    poll$.next()
    tick(0)

    expect(data).toEqual([1, 2])
    expect(init).toEqual([false, true])
  }))
})
