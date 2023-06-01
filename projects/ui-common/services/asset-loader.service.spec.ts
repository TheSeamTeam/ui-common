import { TestBed } from '@angular/core/testing'

import { AssetLoaderService } from './asset-loader.service'

describe('AssetLoaderService', () => {
  let service: AssetLoaderService

  beforeEach(() => {
    TestBed.configureTestingModule({ teardown: { destroyAfterEach: false } })
    service = TestBed.inject(AssetLoaderService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
