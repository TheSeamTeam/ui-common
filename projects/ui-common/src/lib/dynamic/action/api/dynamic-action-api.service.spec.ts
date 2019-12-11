import { TestBed } from '@angular/core/testing'

import { JexlEvaluator } from '../../evaluators'
import { THESEAM_DYNAMIC_VALUE_EVALUATOR } from '../../tokens/dynamic-value-evaluator'
import { DynamicActionApiService } from './dynamic-action-api.service'

fdescribe('DynamicActionApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true }
    ]
  }))

  it('should be created', () => {
    const service: DynamicActionApiService = TestBed.get(DynamicActionApiService)
    expect(service).toBeTruthy()
  })

  // A default config is providedIn root, so this just makes sure that the
  // default config is still being provided correctly.
  it('should have an api config', () => {
    const service: DynamicActionApiService = TestBed.get(DynamicActionApiService)

    // Make sure a config is provided.
    expect((service as any)._configs).toBeDefined()
    // Make sure `multi` was used, so that multiple configs can be provided.
    expect(Array.isArray((service as any)._configs)).toBe(true)
    // Default does not have an id, so this makes sure a default config is provided.
    expect((service as any)._configs.find(c => c.id === undefined)).toBeDefined()
  })

  // it('should add the default config headers to a request', () => {

  // })

  // it('should add the config headers to a request matching provided id', () => {

  // })

  // it('should still execute request if a config with matching id does not exist', () => {

  // })

  // it('should build headers value', () => {

  // })

  // it('should append config url to endpoint', () => {

  // })

  // it('should use endpoint only as url', () => {

  // })

  // it('should use correct request method', () => {

  // })

  // it('should build body value', () => {

  // })

  // it('should build params value', () => {

  // })


})
