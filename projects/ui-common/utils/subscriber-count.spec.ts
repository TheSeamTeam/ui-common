import { fakeAsync, tick } from '@angular/core/testing'
import { Observable, Subject } from 'rxjs'

import { subscriberCount, SubscriberCountChangedFn } from './subscriber-count'

describe('subscriberCount', () => {
  // const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { })

  // const testLogger = { log: (args) => {} }
  // const consoleLogSpy = jasmine.createSpyObj([ 'log' ])

  beforeEach(() => {
    // consoleLogSpy.mockClear()
    resetSubscriberCounts()
  })

  // afterAll(() => {consoleLogSpy.mockRestore()})

  // it('should log to console', fakeAsync(() => {
  //   const subject = new Subject<void>()
  //   const obs = subscriberCount(subject, 'abc')
  //   const sub = obs.subscribe()
  //   expect(console.log).toBeCalledTimes(1)
  //   expect(console.log).toHaveBeenLastCalledWith('abc subscriptions: 1  [subscribed]')
  //   sub.unsubscribe()
  //   expect(console.log).toBeCalledTimes(2)
  //   expect(console.log).toHaveBeenLastCalledWith('abc subscriptions: 0  [unsubscribed]')
  // }))

  // it('should call provided count changed fn', fakeAsync(() => {
  //   const countChangedFnSpy = jest.fn()
  //   const subject = new Subject<void>()
  //   const obs = subscriberCount(subject, 'abc', countChangedFnSpy)
  //   const sub = obs.subscribe()
  //   expect(countChangedFnSpy).toBeCalledTimes(1)
  //   expect(countChangedFnSpy).toHaveBeenLastCalledWith('abc', 1, 'subscribed')
  //   sub.unsubscribe()
  //   expect(countChangedFnSpy).toBeCalledTimes(2)
  //   expect(countChangedFnSpy).toHaveBeenLastCalledWith('abc', 0, 'unsubscribed')
  // }))

  // it('should not log', fakeAsync(() => {
  //   const subject = new Subject<void>()
  //   const obs = subscriberCount(subject, 'abc', null)
  //   const sub = obs.subscribe()
  //   expect(console.log).toBeCalledTimes(0)
  //   sub.unsubscribe()
  //   expect(console.log).toBeCalledTimes(0)
  // }))

  it('should update __subscriberCounts', fakeAsync(() => {
    const win = window as any
    const subject = new Subject<void>()
    expect(win.__subscriberCounts).not.toBeDefined()
    const obs = subscriberCount(subject, 'abc', null)
    expect(win.__subscriberCounts).not.toBeDefined()
    const sub = obs.subscribe()
    expect(win.__subscriberCounts).toBeDefined()
    expect(win.__subscriberCounts['abc']).toBe(1)
    sub.unsubscribe()
    expect(win.__subscriberCounts['abc']).toBe(0)
  }))
})

/**
 * Default subscriberCount sets the count on a window object, so this can be
 * used to reset it before each test.
 */
function resetSubscriberCounts(): void {
  const win = window as any
  win.__subscriberCounts = null
  delete win.__subscriberCounts
}
