import { Observable, Subscriber } from 'rxjs'

export type SubscriberCountChangedFn = (description: string, count: number, reason: 'subscribed' | 'unsubscribed') => void

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
export function subscriberCount<T>(
  sourceObservable: Observable<T>,
  description: string,
  countChangedFn: SubscriberCountChangedFn | undefined | null = logOnChange
) {
  let counter = 0
  return new Observable((subscriber: Subscriber<T>) => {
    const subscription = sourceObservable.subscribe(subscriber)
    counter++
    if (countChangedFn !== undefined && countChangedFn !== null) {
      countChangedFn(description, counter, 'subscribed')
    }
    setGlobalSubscriberCount(description, counter)

    return () => {
      subscription.unsubscribe()
      counter--
      if (countChangedFn !== undefined && countChangedFn !== null) {
        countChangedFn(description, counter, 'unsubscribed')
      }
      setGlobalSubscriberCount(description, counter)
    }
  })
}

const logOnChange: SubscriberCountChangedFn = (description: string, count: number, reason: 'subscribed' | 'unsubscribed') => {
  console.log(`${description} subscriptions: ${count}  [${reason}]`)
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
