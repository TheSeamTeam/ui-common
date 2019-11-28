import { TestBed } from '@angular/core/testing'

import { DynamicValueHelperService } from '../../dynamic-value-helper.service'
import { THESEAM_DYNAMIC_VALUE_EVALUATOR } from '../../tokens/dynamic-value-evaluator'

import { JexlEvaluator } from './jexl-evaluator'
import { IJexlValue } from './jexl-value'

fdescribe('JexlEvaluator', () => {

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true }
    ]
  }))

  it('should return transformed value if input type is evaluatable', () => {
    const service: DynamicValueHelperService = TestBed.get(DynamicValueHelperService)
    const inValue: IJexlValue = { type: 'jexl', expr: 'a.b' }
    const context = { a: { b: 'thing' } }
    const outValue = service.evalSync(inValue, context)
    expect(outValue).toBe(context.a.b)
  })

  it('should return transformed value if input type is evaluatable', async () => {
    const service: DynamicValueHelperService = TestBed.get(DynamicValueHelperService)
    const inValue: IJexlValue = { type: 'jexl', expr: 'a.b' }
    const context = { a: { b: 'thing' } }
    const outValue = await service.eval(inValue, context)
    expect(outValue).toBe(context.a.b)
  })

})
