import { fakeAsync, tick } from '@angular/core/testing'
import { Observable } from 'rxjs'

import { wrapIntoObservable } from './wrap-into-observable'

describe('wrapIntoObservable', () => {
  describe('Value', () => {
    it('completes with value', fakeAsync(() => {
      const value = 123
      const obs = wrapIntoObservable(value)
      let result: number | undefined
      obs.subscribe(v => result = v)
      tick(0)
      expect(result).toBe(123)
    }))
  })

  describe('Promise', () => {
    it('completes with Promise', fakeAsync(() => {
      const value = new Promise<number>((resolve, reject) => resolve(123))
      const obs = wrapIntoObservable(value)
      let result: number | undefined
      obs.subscribe(v => result = v)
      tick(0)
      expect(result).toBe(123)
    }))

    it('completes with Promise after delay', fakeAsync(() => {
      const value = new Promise<number>((resolve, reject) => setTimeout(() => resolve(123), 5))
      const obs = wrapIntoObservable(value)
      let result: number | undefined
      obs.subscribe(v => result = v)
      tick(4)
      expect(result).toBe(undefined)
      tick(1)
      expect(result).toBe(123)
    }))
  })

  describe('Observable', () => {
    it('completes with Observable', fakeAsync(() => {
      const value = new Observable<number>(subscriber => subscriber.next(123))
      const obs = wrapIntoObservable(value)
      let result: number | undefined
      obs.subscribe(v => result = v)
      tick(0)
      expect(result).toBe(123)
    }))

    it('completes with Observable after delay', fakeAsync(() => {
      const value = new Observable<number>(subscriber => { setTimeout(() => subscriber.next(123), 5) })
      const obs = wrapIntoObservable(value)
      let result: number | undefined
      obs.subscribe(v => result = v)
      tick(4)
      expect(result).toBe(undefined)
      tick(1)
      expect(result).toBe(123)
    }))
  })
})
