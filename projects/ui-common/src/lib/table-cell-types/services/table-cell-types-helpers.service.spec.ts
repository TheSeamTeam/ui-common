import { TestBed } from '@angular/core/testing'

import { TableCellTypesHelpersService } from './table-cell-types-helpers.service'

describe('TableCellTypesHelpersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: TableCellTypesHelpersService = TestBed.get(TableCellTypesHelpersService)
    expect(service).toBeTruthy()
  })
})
