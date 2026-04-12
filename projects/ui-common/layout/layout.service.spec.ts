import { TestBed } from '@angular/core/testing'
import { Subscription } from 'rxjs'

import { TheSeamLayoutService } from './layout.service'

describe('TheSeamLayoutService', () => {
  let service: TheSeamLayoutService
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

    TestBed.configureTestingModule({ teardown: { destroyAfterEach: false } })
    service = TestBed.inject(TheSeamLayoutService)
  })

  afterEach(() => {
    subscription?.unsubscribe()
    window.matchMedia = originalMatchMedia
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('isMobile$', () => {
    it('should emit a boolean on subscribe', () => {
      const values: boolean[] = []
      subscription = service.isMobile$.subscribe((v) => values.push(v))
      expect(values.length).toBe(1)
      expect(typeof values[0]).toBe('boolean')
    })

    it('should default to the lt-sm breakpoint', () => {
      subscription = service.isMobile$.subscribe()
      expect(window.matchMedia).toHaveBeenCalledWith(
        'screen and (max-width: 599px)',
      )
    })
  })

  describe('observe', () => {
    it('should return an observable for the given alias', () => {
      mockMql.matches = true
      const values: boolean[] = []

      subscription = service.observe('gt-sm').subscribe((v) => values.push(v))

      expect(window.matchMedia).toHaveBeenCalledWith(
        'screen and (min-width: 960px)',
      )
      expect(values).toEqual([true])
    })
  })

  describe('setMobileBreakpoint', () => {
    it('should cause isMobile$ to use the new breakpoint', () => {
      const values: boolean[] = []
      subscription = service.isMobile$.subscribe((v) => values.push(v))

      const matchMediaMock = window.matchMedia as jest.Mock
      matchMediaMock.mockClear()

      service.setMobileBreakpoint('lt-md')

      expect(window.matchMedia).toHaveBeenCalledWith(
        'screen and (max-width: 959px)',
      )
    })

    it('should emit updated value after changing breakpoint', () => {
      const values: boolean[] = []
      subscription = service.isMobile$.subscribe((v) => values.push(v))

      // Initial emission with lt-sm (default)
      expect(values).toEqual([false])

      // Switch to lt-md and have the new query match
      mockMql.matches = true
      service.setMobileBreakpoint('lt-md')

      expect(values).toEqual([false, true])
    })
  })
})
