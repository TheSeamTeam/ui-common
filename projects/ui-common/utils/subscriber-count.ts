import { Observable, Subscriber } from 'rxjs'

/**
 * This is just for helping debug observables that aren't being unsubscribed
 * from correctly.
 *
 * If description is 'foo' then you can check the how many observers are
 * subscribed with the expression `__subscriberCounts['foo']`. In a debugger you
 * can add the expression to the "Watch" expressions or in Chrome Devtools
 * Console you can add it to the live expressions(Add live expressions by
 * clicking the eye the the left of the Console filter input).
 */
export function subscriberCount<T>(sourceObservable: Observable<T>, description: string, logSubscriptions: boolean = true) {
  let counter = 0
  return new Observable((subscriber: Subscriber<T>) => {
    const subscription = sourceObservable.subscribe(subscriber)
    counter++
    if (logSubscriptions) {
      console.log(`${description} subscriptions: ${counter}`)
    }
    setGlobalSubscriberCount(description, counter)

    return () => {
      subscription.unsubscribe()
      counter--
      if (logSubscriptions) {
        console.log(`${description} subscriptions: ${counter}`)
      }
      setGlobalSubscriberCount(description, counter)
    }
  })
}

function getGlobalSubscriberCounts(): { [description: string]: number } {
  const w = window as any
  if (w.__subscriberCounts === undefined || w.__subscriberCounts === null) {
    w.__subscriberCounts = {}
  }
  return w.__subscriberCounts
}

function setGlobalSubscriberCount(description: string, count: number): void {
  getGlobalSubscriberCounts()[description] = count
}
