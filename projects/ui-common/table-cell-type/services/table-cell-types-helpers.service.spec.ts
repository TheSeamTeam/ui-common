import { TestBed } from '@angular/core/testing'

import { TableCellTypesHelpersService } from './table-cell-types-helpers.service'

describe('TableCellTypesHelpersService', () => {
  beforeEach(() => TestBed.configureTestingModule({ teardown: { destroyAfterEach: false } }))

  it('should be created', () => {
    const service: TableCellTypesHelpersService = TestBed.get(TableCellTypesHelpersService)
    expect(service).toBeTruthy()
  })
})
