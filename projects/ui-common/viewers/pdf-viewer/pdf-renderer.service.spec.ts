import { TestBed } from '@angular/core/testing'

import { PdfRendererService } from './pdf-renderer.service'

describe('PdfRendererService', () => {
  let service: PdfRendererService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(PdfRendererService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
