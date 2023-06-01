import { TestBed } from '@angular/core/testing'

import { DashboardWidgetsPreferencesService } from './dashboard-widgets-preferences.service'

describe('DashboardWidgetsPreferencesService', () => {
  beforeEach(() => TestBed.configureTestingModule({ teardown: { destroyAfterEach: false } }))

  it('should be created', () => {
    const service: DashboardWidgetsPreferencesService = TestBed.get(DashboardWidgetsPreferencesService)
    expect(service).toBeTruthy()
  })
})
