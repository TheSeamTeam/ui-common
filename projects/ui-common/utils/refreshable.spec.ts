import { fakeAsync, tick } from '@angular/core/testing'
import { Subject, of, throwError } from 'rxjs'

import { Refreshable } from './refreshable'

describe('Refreshable', () => {
  // Tests added incrementally across tasks A2–A8.

  it('should be defined', () => {
    expect(Refreshable).toBeDefined()
  })
})
