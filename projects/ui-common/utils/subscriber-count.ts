import { Observable, Subscriber } from 'rxjs'

/**
 * This is just for helping debug observables that aren't being unsubscribed
 * from correctly.
 */
function subscriberCount<T>(sourceObservable: Observable<T>, description: string) {
  let counter = 0
  return new Observable((subscriber: Subscriber<T>) => {
    const subscription = sourceObservable.subscribe(subscriber)
    counter++
    console.log(`${description} subscriptions: ${counter}`)

    return () => {
      subscription.unsubscribe()
      counter--
      console.log(`${description} subscriptions: ${counter}`)
    }
  })
}
