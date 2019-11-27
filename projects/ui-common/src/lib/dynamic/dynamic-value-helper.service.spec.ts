import { TestBed } from '@angular/core/testing'

import { DynamicValueHelperService } from './dynamic-value-helper.service'
import { IJexlExpression } from './models/jexl-expresion'

fdescribe('DynamicValueHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: DynamicValueHelperService = TestBed.get(DynamicValueHelperService)
    expect(service).toBeTruthy()
  })

  it('should return input value if input type is not a type to be handled.', () => {
    const service: DynamicValueHelperService = TestBed.get(DynamicValueHelperService)
    const inValue = 'a'
    const outValue = service.eval(inValue)
    expect(outValue).toBe(inValue)
  })

  it('should return transformed value if input type is an IJexlExpression', () => {
    const service: DynamicValueHelperService = TestBed.get(DynamicValueHelperService)
    const inValue: IJexlExpression = { type: 'jexl', expr: 'a.b' }
    const context = { a: { b: 'thing' } }
    const outValue = service.eval(inValue, context)
    expect(outValue).toBe(context.a.b)
  })
})
