import { TestBed } from '@angular/core/testing'

import { DynamicDatatableRowActionsService } from './dynamic-datatable-row-actions.service'

describe('DynamicDatatableRowActionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({ teardown: { destroyAfterEach: false } }))

  it('should be created', () => {
    const service: DynamicDatatableRowActionsService = TestBed.get(DynamicDatatableRowActionsService)
    expect(service).toBeTruthy()
  })
})
