import { TestBed } from '@angular/core/testing'

import { AssetReaderHelperService } from './asset-reader-helper.service'

describe('AssetReaderHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: AssetReaderHelperService = TestBed.get(AssetReaderHelperService)
    expect(service).toBeTruthy()
  })
})
