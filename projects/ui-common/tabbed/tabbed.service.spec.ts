/* tslint:disable:no-unused-variable */

import { inject, TestBed, waitForAsync } from '@angular/core/testing'
import { TabbedService } from './tabbed.service'

describe('Service: Tabbed', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    providers: [TabbedService],
    teardown: { destroyAfterEach: false }
})
  })

  it('should ...', inject([TabbedService], (service: TabbedService) => {
    expect(service).toBeTruthy()
  }))
})
