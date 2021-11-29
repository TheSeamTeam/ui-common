import { HarnessEnvironment, HarnessLoader, TestElement } from '@angular/cdk/testing'
import { UnitTestElement } from '@angular/cdk/testing/testbed'

import { instrument } from '@storybook/instrumenter'

// TODO: Clean up the instrumentation code.
//   The instrumenter doesn't have much documentation, so I am still learning
//   how it works. The following is probably a lot of unnecessary code.

async function _harnessFn(element: any, ...args: any): Promise<any> {
  return Promise.resolve()
}

const functionsToInstrument: string[] = [
  'blur',
  'clear',
  'click',
  'rightClick',
  'focus',
  // 'getCssValue',
  'hover',
  'mouseAway',
  'sendKeys',
  'text',
  // 'getAttribute',
  // 'hasClass',
  // 'getDimensions',
  // 'getProperty',
  // 'matchesSelector',
  // 'isFocused',
  'setInputValue',
  'selectOptions',
  'dispatchEvent',
]

const toInstrumentObj: any = {}
for (const x of functionsToInstrument) {
  toInstrumentObj[x] = _harnessFn
}

const instrumentedFns = instrument(
  toInstrumentObj,
  { intercept: true }
)


function decorateHarnessFn(fn: ((...args: any) => Promise<any>), fnName: string) {
  return async function(this: any, ...args: any[]) {
    return await instrumentedFns[fnName](this.element, args).then(async () => {
      return await fn.apply(this, args)
    })
  }
}

function decorateUnitTestElement(type: any, fnName: string): void {
  type.prototype[fnName] = decorateHarnessFn(type.prototype[fnName], fnName)
}

export function UnitTestElementInstrumented(): ClassDecorator {
  // tslint:disable-next-line: only-arrow-functions
  return function(
    type: any
  ) {
    // decorateUnitTestElement(type, 'click')
    for (const x of functionsToInstrument) {
      decorateUnitTestElement(type, x)
    }
  }
}

@UnitTestElementInstrumented()
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
