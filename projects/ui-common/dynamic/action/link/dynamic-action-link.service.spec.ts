import { TestBed } from '@angular/core/testing'

import { DynamicActionLinkService } from './dynamic-action-link.service'

describe('DynamicActionLinkService', () => {
  beforeEach(() => TestBed.configureTestingModule({ teardown: { destroyAfterEach: false } }))

  it('should be created', () => {
    const service: DynamicActionLinkService = TestBed.get(DynamicActionLinkService)
    expect(service).toBeTruthy()
  })
})
