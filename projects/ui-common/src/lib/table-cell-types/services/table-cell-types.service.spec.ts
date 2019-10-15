import { TestBed } from '@angular/core/testing'

import { TableCellTypesService } from './table-cell-types.service'

describe('TableCellTypesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: TableCellTypesService = TestBed.get(TableCellTypesService)
    expect(service).toBeTruthy()
  })
})
