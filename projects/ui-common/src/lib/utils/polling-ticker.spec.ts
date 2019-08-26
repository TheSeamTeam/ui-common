import { fakeAsync, tick } from '@angular/core/testing'

import { of, Subject } from 'rxjs'

import { pollingTicker } from './polling-ticker'

describe('pollingTicker', () => {

  describe('sync action', () => {
    it('should skip first emit if emitOnInit = false', fakeAsync(() => {
      let count = 0
      const pt$ = pollingTicker(() => {}, 100, undefined, { emitOnInit: false }).subscribe(() => { count++ })
      tick(99)
      expect(count).toBe(0)
      pt$.unsubscribe()
    }))

    it('should emit immediately if emitOnInit = true', fakeAsync(() => {
      let count = 0
      const pt$ = pollingTicker(() => {}, 100, undefined, { emitOnInit: true }).subscribe(() => { count++ })
      expect(count).toBe(1)
      pt$.unsubscribe()
    }))

    it('should not emit before polling interval', fakeAsync(() => {
      let result
      const pt$ = pollingTicker(() => 'test', 100, undefined, { emitOnInit: false }).subscribe((v) => { result = v })
      tick(99)
      expect(result).toBeUndefined()
      pt$.unsubscribe()
    }))

    it('should emit at polling interval', fakeAsync(() => {
      let result
      const pt$ = pollingTicker(() => 'test', 100, undefined, { emitOnInit: false }).subscribe((v) => { result = v })
      tick(100)
      expect(result).toBe('test')
      pt$.unsubscribe()
    }))

    it('should emit at each polling interval', fakeAsync(() => {
      let count = 0
      const pt$ = pollingTicker(() => {}, 100).subscribe(() => { count++ })
      tick(300)
      expect(count).toBe(4)
      pt$.unsubscribe()
    }))
  })

  describe('observable action', () => {
    it('should skip first emit if emitOnInit = false', fakeAsync(() => {
      let count = 0
      const pt$ = pollingTicker(() => of('api result'), 100, undefined, { emitOnInit: false }).subscribe(() => { count++ })
      tick(99)
      expect(count).toBe(0)
      pt$.unsubscribe()
    }))

    it('should emit immediately if emitOnInit = true', fakeAsync(() => {
      let count = 0
      const pt$ = pollingTicker(() => of('api result'), 100, undefined, { emitOnInit: true }).subscribe(() => { count++ })
      expect(count).toBe(1)
      pt$.unsubscribe()
    }))

    it('should not emit before polling interval', fakeAsync(() => {
      let result
      const pt$ = pollingTicker(() => of('api result'), 100, undefined, { emitOnInit: false }).subscribe((v) => { result = v })
      tick(99)
      expect(result).toBeUndefined()
      pt$.unsubscribe()
    }))

    it('should emit at polling interval', fakeAsync(() => {
      let result
      const pt$ = pollingTicker(() => of('api result'), 100, undefined, { emitOnInit: false }).subscribe((v) => { result = v })
      tick(100)
      expect(result).toBe('api result')
      pt$.unsubscribe()
    }))

    it('should emit at each polling interval', fakeAsync(() => {
      let count = 0
      const pt$ = pollingTicker(() => of('api result'), 100).subscribe(() => { count++ })
      tick(300)
      expect(count).toBe(4)
      pt$.unsubscribe()
    }))
  })

  describe('ticker only', ()  => {
    it('should emit on ticker emit', fakeAsync(() => {
      let count = 0
      const ticker = new Subject<void>()
      const pt$ = pollingTicker(() => of('api result'), undefined, ticker, { emitOnInit: false }).subscribe(() => { count++ })
      tick(1)
      expect(count).toBe(0)
      ticker.next()
      expect(count).toBe(1)
      pt$.unsubscribe()
    }))
  })

  describe('polling interval with ticker', () => {
    it('should reset interval on ticker emit', fakeAsync(() => {
      let count = 0
      const ticker = new Subject<void>()
      const pt$ = pollingTicker(() => of('api result'), 100, ticker, { emitOnInit: false }).subscribe(() => { count++ })
      tick(99)
      expect(count).toBe(0)
      ticker.next()
      tick(1)
      // Interval should have emitted at 100, so count would be 2 if ticker ran
      // at 99 and interval at 100.
      expect(count).toBe(1)
      tick(98)
      expect(count).toBe(1)
      tick(1)
      expect(count).toBe(2)
      pt$.unsubscribe()
    }))
  })

})
