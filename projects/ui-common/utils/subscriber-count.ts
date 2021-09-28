import { Observable, Subscriber } from 'rxjs'

declare let window: any

/**
 * This is just for helping debug observables that aren't being unsubscribed
 * from correctly.
 */
export function subscriberCount<T>(sourceObservable: Observable<T>, description: string) {
  let counter = 0
  return new Observable((subscriber: Subscriber<T>) => {
    const subscription = sourceObservable.subscribe(subscriber)
    counter++
    console.log(`${description} subscriptions: ${counter}`)
    if (window.__subscriberCounts === undefined) {
      window.__subscriberCounts = {}
    }
    window.__subscriberCounts[description] = counter

    return () => {
      subscription.unsubscribe()
      counter--
      console.log(`${description} subscriptions: ${counter}`)
      window.__subscriberCounts[description] = counter
    }
  })
}
