import { TestBed } from '@angular/core/testing'

import { DynamicActionHelperService } from './dynamic-action-helper.service'

describe('DynamicActionHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({ teardown: { destroyAfterEach: false } }))

  it('should be created', () => {
    const service: DynamicActionHelperService = TestBed.get(DynamicActionHelperService)
    expect(service).toBeTruthy()
  })
})
