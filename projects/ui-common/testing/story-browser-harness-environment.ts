import { HarnessEnvironment, HarnessLoader, TestElement } from '@angular/cdk/testing'
import { UnitTestElement } from '@angular/cdk/testing/testbed'

import { instrument } from '@storybook/instrumenter'

// TODO: Clean up the instrumentation code.
//   The instrumenter doesn't have much documentation, so I am still learning
//   how it works. The following is probably a lot of unnecessary code.

function decorateHarnessFn(fn: ((...args: any) => Promise<any>), instrumentedFn: any) {
  return function(this: any, ...args: any[]) {
    return instrumentedFn(this.element, ...args).then(async () => {
      return await fn.apply(this, args)
    })
  }
}

export function UnitTestElementInstrumented(fnNames: string[]): ClassDecorator {
  // Make a function to instrument for each function that would be instrumented.
  // These functions will be a simple function that returns nothing but a
  // Promise. It will be instrumented and called before the original function,
  // because the original function doesn't take the HTMLElement as an argument
  // and I want it to be shown in the Interactions Panel.
  const toInstrumentObj: { [fnName: string]: any } = { }
  for (const x of fnNames) {
    toInstrumentObj[x] = (element: any, ...args: any) => Promise.resolve()
  }

  // Instrument the functions.
  const instrumentedFns = instrument(
    toInstrumentObj,
    { intercept: true }
  )

  // tslint:disable-next-line: only-arrow-functions
  return function(
    type: any
  ) {
    for (const x of fnNames) {
      type.prototype[x] = decorateHarnessFn(type.prototype[x], instrumentedFns[x])
    }
  }
}

@UnitTestElementInstrumented([
  'blur',
  'clear',
  'click',
  'rightClick',
  'focus',
  'hover',
  'mouseAway',
  'sendKeys',
  'text',
  'setInputValue',
  'selectOptions',
  'dispatchEvent',
])
export class StoryBrowserUnitTestElement extends UnitTestElement { }



export class StoryBrowserHarnessEnvironment extends HarnessEnvironment<Element> {
  /**
   * We need this to keep a reference to the document.
   * This is different to `rawRootElement` which is the root element
   * of the harness's environment.
   * (The harness's environment is more of a context)
   */
  private _documentRoot: Element

  constructor(
    rawRootElement: Element,
    { documentRoot }: { documentRoot: Element }
  ) {
    super(rawRootElement)
    this._documentRoot = documentRoot
  }

  /** Creates a `HarnessLoader` rooted at the document root. */
  static loader(element?: Element): HarnessLoader {
    return new StoryBrowserHarnessEnvironment(element || document.body, { documentRoot: document.body })
  }

  forceStabilize(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  waitForTasksOutsideAngular(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  protected getDocumentRoot(): Element {
    return this._documentRoot
  }

  protected createTestElement(element: Element): TestElement {
    // return new UnitTestElement(element, () => Promise.resolve())
    return new StoryBrowserUnitTestElement(element, () => Promise.resolve())
  }

  protected createEnvironment(element: Element): HarnessEnvironment<Element> {
    return new StoryBrowserHarnessEnvironment(element, {
      documentRoot: this._documentRoot,
    })
  }

  protected async getAllRawElements(selector: string): Promise<Element[]> {
    return Array.from(this.rawRootElement.querySelectorAll(selector))
  }
}
