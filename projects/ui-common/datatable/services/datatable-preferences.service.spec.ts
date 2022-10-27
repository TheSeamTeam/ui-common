import { TestBed } from '@angular/core/testing'

import { DatatablePreferencesService } from './datatable-preferences.service'

describe('DatatablePreferencesService', () => {
  beforeEach(() => TestBed.configureTestingModule({ teardown: { destroyAfterEach: false } }))

  it('should be created', () => {
    const service: DatatablePreferencesService = TestBed.get(DatatablePreferencesService)
    expect(service).toBeTruthy()
  })
})
