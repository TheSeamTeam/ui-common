import { Subscription } from 'rxjs'

import { observeMediaQuery } from './observe-media-query'

describe('observeMediaQuery', () => {
  let subscription: Subscription
  let mockMql: {
    matches: boolean
    addEventListener: jest.Mock
    removeEventListener: jest.Mock
  }
  let changeHandler: ((event: Partial<MediaQueryListEvent>) => void) | undefined
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    changeHandler = undefined
    mockMql = {
      matches: false,
      addEventListener: jest.fn(
        (
          _event: string,
          handler: (event: Partial<MediaQueryListEvent>) => void,
        ) => {
          changeHandler = handler
        },
      ),
      removeEventListener: jest.fn(),
    }

    window.matchMedia = jest
      .fn()
      .mockReturnValue(mockMql) as unknown as typeof window.matchMedia
  })

  afterEach(() => {
    subscription?.unsubscribe()
    window.matchMedia = originalMatchMedia
  })

  it('should call matchMedia with the correct query for the alias', () => {
    subscription = observeMediaQuery('lt-sm').subscribe()
    expect(window.matchMedia).toHaveBeenCalledWith(
      'screen and (max-width: 599px)',
    )
  })

  it('should emit the current matches value immediately', () => {
    mockMql.matches = true
    const values: boolean[] = []

    subscription = observeMediaQuery('xs').subscribe((v) => values.push(v))

    expect(values).toEqual([true])
  })

  it('should emit false when the media query does not match', () => {
    mockMql.matches = false
    const values: boolean[] = []

    subscription = observeMediaQuery('xs').subscribe((v) => values.push(v))

    expect(values).toEqual([false])
  })

  it('should emit updated values when the media query changes', () => {
    mockMql.matches = false
    const values: boolean[] = []

    subscription = observeMediaQuery('gt-sm').subscribe((v) => values.push(v))
    expect(values).toEqual([false])

    changeHandler!({ matches: true } as Partial<MediaQueryListEvent>)
    expect(values).toEqual([false, true])

    changeHandler!({ matches: false } as Partial<MediaQueryListEvent>)
    expect(values).toEqual([false, true, false])
  })

  it('should not re-emit when the value has not changed (distinctUntilChanged)', () => {
    mockMql.matches = false
    const values: boolean[] = []

    subscription = observeMediaQuery('md').subscribe((v) => values.push(v))

    changeHandler!({ matches: false } as Partial<MediaQueryListEvent>)
    changeHandler!({ matches: false } as Partial<MediaQueryListEvent>)
    expect(values).toEqual([false])

    changeHandler!({ matches: true } as Partial<MediaQueryListEvent>)
    changeHandler!({ matches: true } as Partial<MediaQueryListEvent>)
    expect(values).toEqual([false, true])
  })

  it('should remove the event listener on unsubscribe', () => {
    subscription = observeMediaQuery('lg').subscribe()

    expect(mockMql.addEventListener).toHaveBeenCalledTimes(1)
    expect(mockMql.removeEventListener).not.toHaveBeenCalled()

    subscription.unsubscribe()

    expect(mockMql.removeEventListener).toHaveBeenCalledTimes(1)
    expect(mockMql.removeEventListener).toHaveBeenCalledWith(
      'change',
      mockMql.addEventListener.mock.calls[0][1],
    )
  })
})
