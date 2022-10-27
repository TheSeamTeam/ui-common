import { TestBed } from '@angular/core/testing'

import { TheSeamLayoutService } from './layout.service'

describe('TheSeamLayoutService', () => {
  beforeEach(() => TestBed.configureTestingModule({ teardown: { destroyAfterEach: false } }))

  it('should be created', () => {
    const service: TheSeamLayoutService = TestBed.get(TheSeamLayoutService)
    expect(service).toBeTruthy()
  })
})
