import { TestBed } from '@angular/core/testing'

import { DynamicValueHelperService } from './dynamic-value-helper.service'
import { DynamicValue } from './models/dynamic-value'
import { IDynamicValueEvaluator } from './models/dynamic-value-evaluator'
import { IDynamicValueType } from './models/dynamic-value-type'
import { THESEAM_DYNAMIC_VALUE_EVALUATOR } from './tokens/dynamic-value-evaluator'

interface ITestValueSync extends IDynamicValueType<'test-sync'> {
  propOnContext: string
}

class TestEvaluatorSync implements IDynamicValueEvaluator<'test-sync'> {

  readonly type = 'test-sync'

  evalSync<R>(value: DynamicValue<R>, context?: any) { return context[(value as any).propOnContext] }

}

interface ITestValueAsync extends IDynamicValueType<'test-async'> {
  propOnContext: string
}

class TestEvaluatorAsync implements IDynamicValueEvaluator<'test-async'> {

  readonly type = 'test-async'

  eval<R>(value: DynamicValue<R>, context?: any) { return Promise.resolve(context[(value as any).propOnContext]) }

}

describe('DynamicValueHelperService', () => {

  describe('Syncronous evaluator', () => {

    beforeEach(() => TestBed.configureTestingModule({
    providers: [
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: TestEvaluatorSync, multi: true }
    ],
    teardown: { destroyAfterEach: false }
}))

    it('should return input value if input type is not an evaluatable.', () => {
      const service: DynamicValueHelperService = TestBed.get(DynamicValueHelperService)
      const inValue = 'a'
      const outValue = service.evalSync(inValue)
      expect(outValue).toBe(inValue)
    })

    it('should return transformed value if input type is evaluatable', () => {
      const service: DynamicValueHelperService = TestBed.get(DynamicValueHelperService)
      const inValue: ITestValueSync = { type: 'test-sync', propOnContext: 'a' }
      const context = { a: 'thing' }
      const outValue = service.evalSync(inValue, context)
      expect(outValue).toBe(context.a as any)
    })
  })

  describe('Asyncronous evaluator', () => {

    beforeEach(() => TestBed.configureTestingModule({
    providers: [
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: TestEvaluatorAsync, multi: true }
    ],
    teardown: { destroyAfterEach: false }
}))

    it('should return input value if input type is not an evaluatable.', async () => {
      const service: DynamicValueHelperService = TestBed.get(DynamicValueHelperService)
      const inValue = 'a'
      const outValue = await service.eval(inValue)
      expect(outValue).toBe(inValue)
    })

    it('should return transformed value if input type is evaluatable', async () => {
      const service: DynamicValueHelperService = TestBed.get(DynamicValueHelperService)
      const inValue: ITestValueAsync = { type: 'test-async', propOnContext: 'a' }
      const context = { a: 'thing' }
      const outValue = await service.eval(inValue, context)
      expect(outValue).toBe(context.a as any)
    })
  })

})
