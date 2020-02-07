import { TestBed } from '@angular/core/testing'

import { FontLoaderService } from './font-loader.service'

describe('FontLoaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: FontLoaderService = TestBed.get(FontLoaderService)
    expect(service).toBeTruthy()
  })
})
