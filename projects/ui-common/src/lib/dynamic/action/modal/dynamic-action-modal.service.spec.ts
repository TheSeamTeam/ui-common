import { TestBed } from '@angular/core/testing'

import { DynamicActionModalService } from './dynamic-action-modal.service'

describe('DynamicActionModalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: DynamicActionModalService = TestBed.get(DynamicActionModalService)
    expect(service).toBeTruthy()
  })
})
