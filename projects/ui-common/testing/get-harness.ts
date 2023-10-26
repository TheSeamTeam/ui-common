import { ComponentHarness, ComponentHarnessConstructor, HarnessQuery } from '@angular/cdk/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { ComponentFixture } from '@angular/core/testing'

import { StorybookHarnessEnvironment } from '@marklb/storybook-harness'

export interface GetHarnessOptions<TComponent = any> {
  canvasElement?: HTMLElement
  fixture?: ComponentFixture<TComponent>
}

export async function getHarness<T extends ComponentHarness>(
  harnessType: HarnessQuery<T>,
  options: GetHarnessOptions
): Promise<T> {
  if (options.fixture !== undefined) {
    if (isComponentHarnessConstructor(harnessType)) {
      return TestbedHarnessEnvironment.harnessForFixture(options.fixture, harnessType)
    }
    throw Error(`Unable to get harness. harnessType must be a ComponentHarness.`)
  }

  if (options.canvasElement !== undefined) {
    return (new StorybookHarnessEnvironment(options.canvasElement))
      .getHarness(harnessType)
  }

  throw Error(`Unable to get harness. fixture or canvasElement must be provided.`)
}

function isComponentHarnessConstructor<T extends ComponentHarness>(value: HarnessQuery<T>): value is ComponentHarnessConstructor<T> {
  return typeof value === 'function' && Object.prototype.hasOwnProperty.call(value, 'hostSelector')
}
