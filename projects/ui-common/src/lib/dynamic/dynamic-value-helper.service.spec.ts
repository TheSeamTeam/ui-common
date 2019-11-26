import { TestBed } from '@angular/core/testing'

import { DynamicValueHelperService } from './dynamic-value-helper.service'

describe('DynamicValueHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: DynamicValueHelperService = TestBed.get(DynamicValueHelperService)
    expect(service).toBeTruthy()
  })
})
