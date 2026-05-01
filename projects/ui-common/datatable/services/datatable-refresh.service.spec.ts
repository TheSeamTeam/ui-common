import { TestBed } from '@angular/core/testing'

import { DatatableRefreshService } from './datatable-refresh.service'

describe('DatatableRefreshService', () => {
  let service: DatatableRefreshService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatatableRefreshService],
    })
    service = TestBed.inject(DatatableRefreshService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('emits on refreshRequested$ each time refresh() is called', () => {
    const events: number[] = []
    let counter = 0
    const sub = service.refreshRequested$.subscribe(() => {
      events.push(++counter)
    })

    service.refresh()
    service.refresh()
    service.refresh()

    expect(events).toEqual([1, 2, 3])
    sub.unsubscribe()
  })

  it('does not emit historical values to late subscribers', () => {
    service.refresh()

    const received: void[] = []
    const sub = service.refreshRequested$.subscribe((v) => received.push(v))

    expect(received).toEqual([])

    service.refresh()
    expect(received.length).toBe(1)

    sub.unsubscribe()
  })
})
