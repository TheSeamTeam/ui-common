import { TestBed } from '@angular/core/testing'

import { DynamicDatatableDefService } from './dynamic-datatable-def.service'

describe('DynamicDatatableDefService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: DynamicDatatableDefService = TestBed.get(DynamicDatatableDefService)
    expect(service).toBeTruthy()
  })
})